/**
 * /api/scan — Vercel serverless function
 *
 * Mottar { domain, email, phone?, name?, firma? }, kjører ti tekniske
 * AEO-sjekker parallelt mot domenet, persisterer resultatet i Supabase
 * (synlighet_leads), sender auto-reply via Resend og returnerer ScanResponse.
 *
 * Rate-limit: 5 forespørsler per hashet IP per time. In-memory Map for
 * MVP — Vercel resirkulerer prosessen mellom invocations, så dette er
 * "best effort", men holder casual misbruk borte. For prod-grade
 * rate-limit må vi flytte til Upstash/Redis eller en counter-tabell.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// ---- Typer (mirror src/lib/scan.ts + src/lib/checks.ts) ----

type CheckId =
  | "reachable"
  | "meta"
  | "schema_org"
  | "key_schemas"
  | "robots_ai"
  | "sitemap"
  | "llms_txt"
  | "www_redirect"
  | "same_as"
  | "canonical_resolves";

type IssueSeverity = "critical" | "warning" | "info";

type ScanIssue = {
  id: CheckId;
  title: string;
  points: number;
  maxPoints: number;
  severity: IssueSeverity;
  summary: string;
  detail?: string;
};

type ScanInput = {
  domain: string;
  email: string;
  phone?: string;
  name?: string;
  firma?: string;
};

type ScanTier = "kritisk" | "svak" | "ok" | "god" | "ypperste";

type ScanResponse = {
  ok: true;
  scanId: string;
  score: number;
  tier: ScanTier;
  domain: string;
  scannedAt: string;
  issues: ScanIssue[];
};

type ScanError = {
  ok: false;
  error: "invalid_domain" | "rate_limited" | "fetch_failed" | "internal" | "missing_field";
  message: string;
};

// ---- Konfig ----

const FETCH_TIMEOUT_MS = 8000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 time
const RATE_LIMIT_MAX = 5;
const UA = "Mozilla/5.0 (compatible; SjekksynligetBot/1.0; +https://sjekksynlighet.no)";

const AI_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "OAI-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "MistralAI-User",
] as const;

const KEY_SCHEMA_TYPES = [
  "LocalBusiness",
  "Service",
  "Product",
  "FAQPage",
  "Article",
  "BlogPosting",
] as const;

// ---- Helpers ----

function jsonResponse<T>(res: VercelResponse, status: number, body: T) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(status).send(JSON.stringify(body));
}

function isValidDomain(raw: string): boolean {
  if (!raw || raw.length > 253) return false;
  const re = /^(?!-)[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,}$/;
  if (!re.test(raw)) return false;
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|0:0:0:0:0:0:0:1)/.test(raw)) {
    return false;
  }
  return true;
}

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}

function hashIp(ip: string | undefined): string {
  const salt = process.env.IP_HASH_SALT || "sjekksynlighet-default-salt";
  return createHash("sha256").update(`${salt}:${ip ?? ""}`).digest("hex").slice(0, 32);
}

function getClientIp(req: VercelRequest): string {
  const xff = (req.headers["x-forwarded-for"] as string | undefined) ?? "";
  const ip = xff.split(",")[0]?.trim() || (req.socket?.remoteAddress ?? "");
  return ip;
}

// In-memory rate-limit. Per Vercel-invocation kan dette resette, men det
// holder mot enkel spam. Bruk Redis/Upstash om vi trenger global limit.
type RateBucket = { count: number; firstSeen: number };
const rateBuckets = new Map<string, RateBucket>();

function rateLimit(ipHash: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(ipHash);
  if (!bucket || now - bucket.firstSeen > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ipHash, { count: 1, firstSeen: now });
    return { allowed: true };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - bucket.firstSeen),
    };
  }
  bucket.count++;
  return { allowed: true };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response | null> {
  const { timeoutMs = FETCH_TIMEOUT_MS, ...rest } = init;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "*/*", ...rest.headers },
      redirect: "follow",
    });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ status: number; body: string; finalUrl: string } | null> {
  const res = await fetchWithTimeout(url, init);
  if (!res) return null;
  try {
    const body = await res.text();
    return { status: res.status, body, finalUrl: res.url };
  } catch {
    return null;
  }
}

async function fetchHeadOrGet(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ status: number; finalUrl: string; redirects: number; location: string | null } | null> {
  // HEAD followed by manual redirect tracking is fragile under undici; just
  // do GET with redirect: 'manual' inside follow-loop.
  let current = url;
  let redirects = 0;
  let lastStatus = 0;
  let lastLocation: string | null = null;
  for (let i = 0; i < 5; i++) {
    const res = await fetchWithTimeout(current, { ...init, redirect: "manual" });
    if (!res) return null;
    lastStatus = res.status;
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      redirects++;
      lastLocation = loc;
      try {
        current = new URL(loc, current).toString();
      } catch {
        break;
      }
      continue;
    }
    return { status: lastStatus, finalUrl: current, redirects, location: lastLocation };
  }
  return { status: lastStatus, finalUrl: current, redirects, location: lastLocation };
}

// ---- Sjekker ----

type CheckOutcome = Omit<ScanIssue, "title" | "maxPoints">;

const CHECK_TITLES: Record<CheckId, string> = {
  reachable: "Nettsiden svarer (HTTP 200)",
  meta: "Title, meta description og canonical",
  schema_org: "Schema.org JSON-LD finnes",
  key_schemas: "Viktige skjema-typer er dekket",
  robots_ai: "robots.txt slipper inn AI-crawlere",
  sitemap: "sitemap.xml er ferskt og komplett",
  llms_txt: "llms.txt finnes",
  www_redirect: "Apex og www peker konsekvent (301)",
  same_as: "sameAs lenker til norske autoritetskilder",
  canonical_resolves: "Canonical-URL resolver",
};

function buildIssue(out: CheckOutcome): ScanIssue {
  return {
    id: out.id,
    title: CHECK_TITLES[out.id],
    points: out.points,
    maxPoints: 10,
    severity: out.severity,
    summary: out.summary,
    detail: out.detail,
  };
}

function pickHomeText(html: string): { title: string; description: string; canonical: string } {
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
  const description =
    (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? "").trim();
  const canonical =
    (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)?.[1] ?? "").trim();
  return { title, description, canonical };
}

function extractLdJsonBlocks(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    const raw = m[1].trim();
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw));
    } catch {
      /* malformed JSON-LD — caught by other checks */
    }
  }
  return out;
}

type SchemaWalk = { types: Set<string>; orgSameAs: string[] };

function walkSchema(node: unknown, acc: SchemaWalk): SchemaWalk {
  if (Array.isArray(node)) {
    for (const x of node) walkSchema(x, acc);
    return acc;
  }
  if (!node || typeof node !== "object") return acc;
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  if (typeof type === "string") acc.types.add(type);
  if (Array.isArray(type)) for (const t of type) if (typeof t === "string") acc.types.add(t);

  // Organization / LocalBusiness can carry sameAs
  if ((type === "Organization" || (Array.isArray(type) && type.includes("Organization")))) {
    if (Array.isArray(obj.sameAs)) {
      for (const s of obj.sameAs) if (typeof s === "string") acc.orgSameAs.push(s);
    }
  }
  // Recurse into @graph and any object children
  if (Array.isArray(obj["@graph"])) {
    for (const x of obj["@graph"]) walkSchema(x, acc);
  }
  for (const v of Object.values(obj)) {
    if (v && (typeof v === "object" || Array.isArray(v))) walkSchema(v, acc);
  }
  return acc;
}

async function runScan(domain: string): Promise<ScanIssue[]> {
  const apex = `https://${domain}`;
  const www = `https://www.${domain}`;

  // Hent homepage (apex først). Hvis apex feiler, prøv www.
  const homeApex = await fetchText(apex);
  const home = homeApex && homeApex.status >= 200 && homeApex.status < 400
    ? homeApex
    : await fetchText(www);

  if (!home) {
    // Kan ikke kjøre videre uten HTML. Returner alt på 0.
    const allFail: ScanIssue[] = (Object.keys(CHECK_TITLES) as CheckId[]).map((id) => ({
      id,
      title: CHECK_TITLES[id],
      points: 0,
      maxPoints: 10,
      severity: "critical",
      summary: "Nettsiden svarte ikke innen tidsavbruddet. Vi kunne ikke kjøre noen sjekker.",
    }));
    allFail[0].detail = `Forsøkte både ${apex} og ${www}.`;
    return allFail;
  }

  const html = home.body;
  const baseUrl = new URL(home.finalUrl).origin;
  const { title, description, canonical } = pickHomeText(html);
  const ldNodes = extractLdJsonBlocks(html);
  const walk = ldNodes.reduce<SchemaWalk>(
    (acc, node) => walkSchema(node, acc),
    { types: new Set(), orgSameAs: [] },
  );

  // Parallelle ekstra-fetches
  const [robotsRes, sitemapRes, llmsRes, apexHead, wwwHead, canonicalHead] = await Promise.all([
    fetchText(`${baseUrl}/robots.txt`),
    fetchText(`${baseUrl}/sitemap.xml`),
    fetchText(`${baseUrl}/llms.txt`),
    fetchHeadOrGet(apex),
    fetchHeadOrGet(www),
    canonical ? fetchHeadOrGet(canonical) : Promise.resolve(null),
  ]);

  const issues: ScanIssue[] = [];

  // 1. reachable
  {
    const ok = home.status >= 200 && home.status < 400;
    issues.push(
      buildIssue({
        id: "reachable",
        points: ok ? 10 : 0,
        severity: ok ? "info" : "critical",
        summary: ok
          ? `${baseUrl} svarte med HTTP ${home.status}.`
          : `${baseUrl} svarte med HTTP ${home.status}. AI-bots og Google klarer ikke å hente forsiden.`,
        detail: `Endelig URL: ${home.finalUrl}`,
      }),
    );
  }

  // 2. meta (title, description, canonical)
  {
    const hasTitle = title.length >= 10 && title.length <= 80;
    const hasDesc = description.length >= 60 && description.length <= 200;
    const hasCanonical = !!canonical;
    let pts = 0;
    if (hasTitle) pts += 4;
    if (hasDesc) pts += 3;
    if (hasCanonical) pts += 3;
    const missing: string[] = [];
    if (!hasTitle) missing.push(title ? `title-lengde ${title.length} tegn` : "title");
    if (!hasDesc) missing.push(description ? `meta description-lengde ${description.length} tegn` : "meta description");
    if (!hasCanonical) missing.push("canonical");
    const sev: IssueSeverity = pts >= 8 ? "info" : pts >= 5 ? "warning" : "critical";
    issues.push(
      buildIssue({
        id: "meta",
        points: pts,
        severity: sev,
        summary:
          pts === 10
            ? "Title (50–60 tegn), meta description (140–200) og canonical er alle på plass."
            : `Manglende eller suboptimalt: ${missing.join(", ")}.`,
      }),
    );
  }

  // 3. schema_org
  {
    const count = ldNodes.length;
    const pts = count >= 2 ? 10 : count === 1 ? 6 : 0;
    const sev: IssueSeverity = count === 0 ? "critical" : count === 1 ? "warning" : "info";
    issues.push(
      buildIssue({
        id: "schema_org",
        points: pts,
        severity: sev,
        summary:
          count === 0
            ? "Vi fant ingen <script type='application/ld+json'> i forsiden. AI-modeller må gjette på hva siden handler om."
            : `${count} JSON-LD blokk${count === 1 ? "" : "er"} funnet i forsidens <head>.`,
      }),
    );
  }

  // 4. key_schemas
  {
    const hasOrg = walk.types.has("Organization");
    const hasWebsite = walk.types.has("WebSite");
    const matchedKey = KEY_SCHEMA_TYPES.filter((t) => walk.types.has(t));
    let pts = 0;
    if (hasOrg) pts += 4;
    if (hasWebsite) pts += 3;
    if (matchedKey.length > 0) pts += 3;
    const missing: string[] = [];
    if (!hasOrg) missing.push("Organization");
    if (!hasWebsite) missing.push("WebSite");
    if (matchedKey.length === 0) missing.push(`en av: ${KEY_SCHEMA_TYPES.join(", ")}`);
    const sev: IssueSeverity = pts >= 8 ? "info" : pts >= 5 ? "warning" : "critical";
    issues.push(
      buildIssue({
        id: "key_schemas",
        points: pts,
        severity: sev,
        summary:
          pts === 10
            ? `Organization + WebSite + ${matchedKey.join(", ")} er definert.`
            : `Mangler: ${missing.join(", ")}. Vi fant: ${[...walk.types].slice(0, 8).join(", ") || "ingen schema-typer"}.`,
        detail: walk.types.size > 0 ? `Schema-typer funnet: ${[...walk.types].join(", ")}` : undefined,
      }),
    );
  }

  // 5. robots_ai
  {
    if (!robotsRes || robotsRes.status >= 400) {
      issues.push(
        buildIssue({
          id: "robots_ai",
          points: 0,
          severity: "critical",
          summary: "Ingen robots.txt funnet. Uten en eksplisitt fil risikerer du at AI-crawlere ikke vet om de er velkomne.",
        }),
      );
    } else {
      const txt = robotsRes.body;
      const allowedBots = AI_BOTS.filter((bot) => {
        // matche `User-agent: <bot>` etterfulgt av minst én linje Allow: / før neste User-agent
        const re = new RegExp(
          `User-agent:\\s*${bot.replace(/-/g, "\\-")}[\\s\\S]*?(?=User-agent:|$)`,
          "i",
        );
        const block = txt.match(re)?.[0] ?? "";
        if (!block) return false;
        if (/Disallow:\s*\/\s*$/im.test(block)) return false;
        return /Allow:\s*\//im.test(block) || /Disallow:\s*$/im.test(block);
      });
      const ratio = allowedBots.length / AI_BOTS.length;
      const pts = Math.round(ratio * 10);
      const sev: IssueSeverity = ratio >= 0.9 ? "info" : ratio >= 0.5 ? "warning" : "critical";
      issues.push(
        buildIssue({
          id: "robots_ai",
          points: pts,
          severity: sev,
          summary:
            ratio === 1
              ? "Alle 11 AI-crawlere har eksplisitt Allow i robots.txt."
              : `${allowedBots.length} av ${AI_BOTS.length} AI-crawlere har eksplisitt Allow. Resten må legges til.`,
          detail: `Allowed: ${allowedBots.join(", ") || "—"}`,
        }),
      );
    }
  }

  // 6. sitemap
  {
    if (!sitemapRes || sitemapRes.status >= 400 || !/<urlset|<sitemapindex/i.test(sitemapRes.body)) {
      issues.push(
        buildIssue({
          id: "sitemap",
          points: 0,
          severity: "critical",
          summary: "Ingen gyldig sitemap.xml funnet. Google og AI-crawlere får ikke vite om alle sidene dine.",
        }),
      );
    } else {
      const xml = sitemapRes.body;
      const urlCount = (xml.match(/<loc>/g) ?? []).length;
      const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)]
        .map((m) => new Date(m[1].trim()).getTime())
        .filter((t) => Number.isFinite(t));
      const newest = lastmods.length ? Math.max(...lastmods) : 0;
      const ageDays = newest ? (Date.now() - newest) / 86_400_000 : Infinity;
      let pts = 0;
      if (urlCount > 0) pts += 4;
      if (urlCount >= 5) pts += 2;
      if (ageDays <= 180) pts += 4;
      else if (ageDays <= 365) pts += 2;
      const sev: IssueSeverity = pts >= 8 ? "info" : pts >= 5 ? "warning" : "critical";
      issues.push(
        buildIssue({
          id: "sitemap",
          points: pts,
          severity: sev,
          summary:
            urlCount === 0
              ? "Sitemap eksisterer men inneholder ingen URLer."
              : ageDays === Infinity
              ? `Sitemap med ${urlCount} URL${urlCount === 1 ? "" : "er"}, men ingen lastmod-felt — vanskelig å se om den er fersk.`
              : ageDays > 180
              ? `Sitemap med ${urlCount} URL${urlCount === 1 ? "" : "er"}, men nyeste lastmod er ${Math.round(ageDays)} dager gammel.`
              : `Sitemap med ${urlCount} URL${urlCount === 1 ? "" : "er"} og fersk lastmod (${Math.round(ageDays)} dager).`,
        }),
      );
    }
  }

  // 7. llms_txt
  {
    if (!llmsRes || llmsRes.status >= 400 || llmsRes.body.trim().length < 10) {
      issues.push(
        buildIssue({
          id: "llms_txt",
          points: 0,
          severity: "warning",
          summary: "Ingen /llms.txt funnet. Dette er et nytt format AI-modeller bruker for å hente en konsis bedriftsoversikt.",
        }),
      );
    } else {
      const txt = llmsRes.body;
      const hasH1 = /^#\s+\S/m.test(txt);
      const lengthOk = txt.length >= 200 && txt.length <= 60_000;
      const pts = (hasH1 ? 6 : 3) + (lengthOk ? 4 : 0);
      const sev: IssueSeverity = pts >= 8 ? "info" : "warning";
      issues.push(
        buildIssue({
          id: "llms_txt",
          points: pts,
          severity: sev,
          summary: hasH1
            ? `llms.txt finnes (${txt.length} tegn) og har en H1-overskrift.`
            : `llms.txt finnes men mangler en H1-overskrift på første linje.`,
        }),
      );
    }
  }

  // 8. www_redirect
  {
    const apexStatus = apexHead?.status ?? 0;
    const wwwStatus = wwwHead?.status ?? 0;
    const apexLoc = apexHead?.location ?? "";
    const wwwLoc = wwwHead?.location ?? "";

    let pts = 0;
    let summary = "";
    let sev: IssueSeverity = "warning";

    const bothOk = apexStatus === 200 && wwwStatus === 200;
    const apex301 = apexStatus === 301 && wwwStatus === 200;
    const www301 = wwwStatus === 301 && apexStatus === 200;
    const apex307 = apexStatus === 307 || apexStatus === 302;
    const www307 = wwwStatus === 307 || wwwStatus === 302;

    if (apex301 || www301) {
      pts = 10;
      sev = "info";
      summary = apex301
        ? `Apex (${apex}) 301-redirecter til www-variant — konsekvent og perfekt for SEO.`
        : `www (${www}) 301-redirecter til apex-variant — konsekvent og perfekt for SEO.`;
    } else if (bothOk) {
      pts = 3;
      sev = "warning";
      summary = "Både apex og www svarer 200 OK uten redirect — Google indekserer begge og splitter equity. Sett opp 301 fra den ene til den andre.";
    } else if (apex307 || www307) {
      pts = 5;
      sev = "warning";
      summary = "Redirect mellom apex og www er 302/307 (midlertidig). Bytt til 301 (permanent) for å konsolidere SEO-signaler.";
    } else if (apexStatus === 0 && wwwStatus === 0) {
      pts = 0;
      sev = "critical";
      summary = "Hverken apex eller www svarte innen tidsavbruddet.";
    } else {
      pts = 4;
      sev = "warning";
      summary = `Apex svarer ${apexStatus || "ikke"}, www svarer ${wwwStatus || "ikke"}. Sjekk at én av variantene 301-redirecter til den andre.`;
    }
    issues.push(
      buildIssue({
        id: "www_redirect",
        points: pts,
        severity: sev,
        summary,
        detail: `apex→${apexStatus}${apexLoc ? ` (→ ${apexLoc})` : ""} | www→${wwwStatus}${wwwLoc ? ` (→ ${wwwLoc})` : ""}`,
      }),
    );
  }

  // 9. same_as
  {
    const same = walk.orgSameAs;
    const hits = {
      brreg: same.some((u) => /brreg\.no/i.test(u)),
      proff: same.some((u) => /proff\.no/i.test(u)),
      no1881: same.some((u) => /1881\.no/i.test(u)),
    };
    const social = same.filter((u) => /(linkedin|facebook|instagram)\.com/i.test(u)).length;
    let pts = 0;
    if (hits.brreg) pts += 4;
    if (hits.proff) pts += 2;
    if (hits.no1881) pts += 2;
    pts += Math.min(2, social);
    const sev: IssueSeverity = pts >= 8 ? "info" : pts >= 4 ? "warning" : "critical";
    const missing: string[] = [];
    if (!hits.brreg) missing.push("brreg.no");
    if (!hits.proff) missing.push("proff.no");
    if (!hits.no1881) missing.push("1881.no");
    issues.push(
      buildIssue({
        id: "same_as",
        points: pts,
        severity: sev,
        summary:
          same.length === 0
            ? "Organization-skjemaet mangler en sameAs-array. AI-modeller har ingen autoritetskilder å verifisere bedriften mot."
            : missing.length === 0
            ? `sameAs lenker til Brønnøysund, Proff og 1881${social > 0 ? ` + ${social} sosiale kilder` : ""}.`
            : `Mangler lenker til: ${missing.join(", ")}. Funnet ${same.length} sameAs-lenker totalt.`,
        detail: same.length > 0 ? `sameAs: ${same.slice(0, 6).join(", ")}${same.length > 6 ? " …" : ""}` : undefined,
      }),
    );
  }

  // 10. canonical_resolves
  {
    if (!canonical) {
      issues.push(
        buildIssue({
          id: "canonical_resolves",
          points: 0,
          severity: "critical",
          summary: "Ingen canonical-tag funnet — kan ikke verifisere at den peker på en levende URL.",
        }),
      );
    } else if (!canonicalHead || canonicalHead.status === 0) {
      issues.push(
        buildIssue({
          id: "canonical_resolves",
          points: 0,
          severity: "critical",
          summary: `Canonical peker på ${canonical}, men URL-en svarte ikke (NXDOMAIN eller timeout). All indekserings-equity lekker til en død adresse.`,
        }),
      );
    } else if (canonicalHead.status >= 400) {
      issues.push(
        buildIssue({
          id: "canonical_resolves",
          points: 3,
          severity: "warning",
          summary: `Canonical peker på ${canonical}, men URL-en svarer ${canonicalHead.status}. Verifiser at den finnes.`,
        }),
      );
    } else {
      issues.push(
        buildIssue({
          id: "canonical_resolves",
          points: 10,
          severity: "info",
          summary: `Canonical peker på ${canonical} og resolver normalt (HTTP ${canonicalHead.status}).`,
        }),
      );
    }
  }

  return issues;
}

function tierFromScore(score: number): ScanTier {
  if (score >= 85) return "ypperste";
  if (score >= 71) return "god";
  if (score >= 51) return "ok";
  if (score >= 31) return "svak";
  return "kritisk";
}

function tierLabel(tier: ScanTier): string {
  return {
    ypperste: "Ypperste klasse",
    god: "God",
    ok: "OK",
    svak: "Svak",
    kritisk: "Kritisk",
  }[tier];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(args: {
  name: string | undefined;
  domain: string;
  score: number;
  tier: ScanTier;
  top3: ScanIssue[];
}): string {
  const greeting = args.name ? `Hei ${escapeHtml(args.name.split(/\s+/)[0])},` : "Hei,";
  const issuesHtml = args.top3.length
    ? args.top3
        .map(
          (i) => `
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #e7e5dc;">
            <div style="font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;color:#0F1419;margin-bottom:4px;">
              ${escapeHtml(i.title)}
            </div>
            <div style="font-family:'Inter',sans-serif;font-size:13px;color:#52525b;line-height:1.55;">
              ${escapeHtml(i.summary)}
            </div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#0D9488;margin-top:6px;">
              ${i.points}/${i.maxPoints} poeng
            </div>
          </td>
        </tr>`,
        )
        .join("")
    : `<tr><td style="padding:14px 18px;color:#10B981;">Vi fant ingen kritiske mangler. Solid teknisk grunnmur.</td></tr>`;

  return `<!doctype html>
<html lang="nb">
<body style="margin:0;background:#FAFAF7;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;color:#0F1419;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFAF7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e7e5dc;border-radius:18px;overflow:hidden;">
        <tr>
          <td style="padding:28px 28px 0 28px;">
            <div style="display:inline-flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:18px;color:#0F1419;">
              <span style="display:inline-block;width:22px;height:22px;border:2.5px solid #0D9488;border-radius:50%;position:relative;">
                <span style="position:absolute;right:-4px;bottom:-4px;width:9px;height:2.5px;background:#0D9488;border-radius:2px;transform:rotate(45deg);"></span>
              </span>
              sjekksynlighet
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px 8px 28px;">
            <div style="font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:#0D9488;letter-spacing:.08em;text-transform:uppercase;">
              Din synlighetscheck er klar
            </div>
            <h1 style="margin:6px 0 0 0;font-family:'DM Sans',sans-serif;font-size:26px;font-weight:600;color:#0F1419;letter-spacing:-0.01em;">
              ${escapeHtml(args.domain)} — ${args.score}/100
            </h1>
            <div style="margin-top:6px;font-family:'Inter',sans-serif;font-size:14px;color:#52525b;">
              Nivå: <strong style="color:#0F1419;">${tierLabel(args.tier)}</strong>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 28px 0 28px;">
            <p style="margin:14px 0 8px 0;font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.6;color:#3f3f46;">
              ${greeting}
            </p>
            <p style="margin:0 0 18px 0;font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.6;color:#3f3f46;">
              Vi har analysert <strong>${escapeHtml(args.domain)}</strong> og funnet en score på <strong>${args.score}/100</strong>. Under finner du de viktigste manglene å fikse først.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 0 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e7e5dc;border-radius:14px;overflow:hidden;">
              ${issuesHtml}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px;">
            <p style="margin:0;font-family:'Inter',sans-serif;font-size:13.5px;line-height:1.6;color:#52525b;">
              Vi tar gjerne en uforpliktende telefonsamtale for å gå gjennom hele rapporten og foreslå tiltak. Hvis du har oppgitt telefonnummer, kan du forvente at vi ringer i løpet av et par dager.
            </p>
            <p style="margin:18px 0 0 0;font-family:'Inter',sans-serif;font-size:12px;color:#a1a1aa;">
              Du mottok denne e-posten fordi du kjørte en synlighetscheck på sjekksynlighet.no. Du kan be om sletting når som helst ved å svare på denne e-posten eller besøke <a href="https://sjekksynlighet.no/personvern" style="color:#0D9488;text-decoration:none;">personvernsiden</a>.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---- Handler ----

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return jsonResponse<ScanError>(res, 405, {
      ok: false,
      error: "internal",
      message: "Method Not Allowed",
    });
  }

  let body: ScanInput | null = null;
  try {
    body = (typeof req.body === "string" ? JSON.parse(req.body) : (req.body as ScanInput)) ?? null;
  } catch {
    body = null;
  }

  if (!body || !body.domain || !body.email) {
    return jsonResponse<ScanError>(res, 400, {
      ok: false,
      error: "missing_field",
      message: "domain og email er påkrevde felter",
    });
  }

  const domain = normalizeDomain(body.domain);
  if (!isValidDomain(domain)) {
    return jsonResponse<ScanError>(res, 400, {
      ok: false,
      error: "invalid_domain",
      message: "Domenet er ugyldig eller peker på et privat nettverk",
    });
  }

  const ip = getClientIp(req);
  const ipHash = hashIp(ip);
  const ua = (req.headers["user-agent"] as string | undefined) ?? "";

  const rl = rateLimit(ipHash);
  if (!rl.allowed) {
    res.setHeader("Retry-After", Math.ceil((rl.retryAfterMs ?? 0) / 1000).toString());
    return jsonResponse<ScanError>(res, 429, {
      ok: false,
      error: "rate_limited",
      message: "For mange forespørsler fra denne IP-en. Prøv igjen om en stund.",
    });
  }

  let issues: ScanIssue[];
  try {
    issues = await runScan(domain);
  } catch (err) {
    console.error("[scan] runScan threw", err);
    return jsonResponse<ScanError>(res, 502, {
      ok: false,
      error: "fetch_failed",
      message: "Vi fikk ikke kontakt med nettsiden. Sjekk at den er live.",
    });
  }

  const score = issues.reduce((s, i) => s + i.points, 0);
  const tier = tierFromScore(score);
  const scanId = randomUUID();
  const scannedAt = new Date().toISOString();

  const response: ScanResponse = {
    ok: true,
    scanId,
    score,
    tier,
    domain,
    scannedAt,
    issues,
  };

  // Persistér + send e-post i parallell. Vi venter på dem så vi får
  // logget feil (Vercel functions har ingen background-jobs), men feiler
  // ikke responsen — brukeren skal se resultatet uansett.
  const supabaseUrl = process.env.SUPABASE_URL;
  // Anon-nøkkel — kun INSERT på synlighet_leads er tillatt via RLS-
  // policy "anon insert leads". CHECK-en der avviser åpenbart
  // misbruk (negative scores, tom email, etc.). Service_role er ikke
  // nødvendig her og ville bypasse RLS unødvendig.
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Sjekksynlighet <onboarding@resend.dev>";

  const persistPromise = (async () => {
    if (!supabaseUrl || !supabaseKey) {
      console.warn("[scan] SUPABASE_URL/SUPABASE_ANON_KEY mangler — hopper over lagring");
      return;
    }
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await supabase.from("synlighet_leads").insert({
        id: scanId,
        domain,
        email: body!.email,
        phone: body!.phone || null,
        name: body!.name || null,
        firma: body!.firma || null,
        scan_score: score,
        scan_result: response,
        status: "new",
        user_agent: ua,
        ip_hash: ipHash,
      });
      if (error) console.error("[scan] supabase insert error", error);
    } catch (err) {
      console.error("[scan] supabase threw", err);
    }
  })();

  const emailPromise = (async () => {
    if (!resendKey) {
      console.warn("[scan] RESEND_API_KEY mangler — hopper over auto-reply");
      return;
    }
    try {
      const resend = new Resend(resendKey);
      const top3 = [...issues]
        .sort((a, b) => b.maxPoints - b.points - (a.maxPoints - a.points))
        .slice(0, 3);
      const html = buildEmailHtml({
        name: body!.name,
        domain,
        score,
        tier,
        top3,
      });
      const text = `Din synlighetscheck er klar.\n\n${domain} — ${score}/100 (${tierLabel(tier)})\n\nTopp-mangler:\n${top3.map((i) => `• ${i.title} (${i.points}/${i.maxPoints})\n  ${i.summary}`).join("\n\n")}\n\nDu mottok denne e-posten fordi du kjørte en synlighetscheck på sjekksynlighet.no. Personvern: https://sjekksynlighet.no/personvern`;
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: body!.email,
        subject: `Din synlighetscheck er klar — ${domain} fikk ${score}/100`,
        html,
        text,
      });
      if (error) console.error("[scan] resend send error", error);
    } catch (err) {
      console.error("[scan] resend threw", err);
    }
  })();

  await Promise.allSettled([persistPromise, emailPromise]);

  return jsonResponse<ScanResponse>(res, 200, response);
}
