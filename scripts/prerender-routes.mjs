#!/usr/bin/env node
/**
 * Per-route static HTML for SPA SEO.
 *
 * sjekksynlighet.no er en Vite/React SPA. Uten prerender ser alle
 * crawlere identisk HTML-skall — det fører til Soft 404-verdikt fra
 * Google (PITFALLS #1) og null kontekst for AI-bots som ikke kjører
 * JavaScript (GPTBot, ClaudeBot, CCBot).
 *
 * Skriptet kjører etter `vite build` og lager:
 *   dist/personvern/index.html
 *
 * Forsiden trenger ikke egen behandling — index.html i roten dekker
 * den, og scriptet legger til en home-FAQ-mirror der hvis det er
 * relevant (i denne MVP har vi allerede FAQ i hovedskallet).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SHELL_PATH = join(DIST, "index.html");
const SITE = "https://sjekksynlighet.no";

if (!existsSync(SHELL_PATH)) {
  console.error("[prerender] dist/index.html not found — kjør 'vite build' først");
  process.exit(1);
}

const SHELL = readFileSync(SHELL_PATH, "utf8");

const ROUTES = [
  {
    path: "/personvern",
    title: "Personvern — Sjekksynlighet",
    description:
      "Personvernerklæring for sjekksynlighet.no. Medcom AS er behandlingsansvarlig (org.nr 936 155 731). Dine GDPR-rettigheter, hva vi lagrer og hvor lenge.",
    h1: "Personvernerklæring for sjekksynlighet.no",
    intro:
      "Sjekksynlighet er et selvstendig verktøy operert av Medcom AS. Denne siden forklarer hva vi lagrer når du kjører en synlighetscheck, hvor lenge, hvem som har tilgang, og hvilke GDPR-rettigheter du har.",
    schemaGraph: (url) => [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "Personvernerklæring",
        description:
          "GDPR-policy for sjekksynlighet.no. Behandlingsansvarlig: Medcom AS, org.nr 936155731.",
        isPartOf: { "@id": `${SITE}/#website` },
        inLanguage: "nb-NO",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-quick-answer]"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Hjem", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Personvern", item: url },
        ],
      },
    ],
  },
];

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function injectMeta(html, { title, description, url, h1, intro }) {
  const safeTitle = htmlEscape(title);
  const safeDesc = htmlEscape(description);
  const safeUrl = htmlEscape(url);
  const safeH1 = htmlEscape(h1);
  const safeIntro = htmlEscape(intro);

  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${safeDesc}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${safeTitle}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${safeDesc}" />`,
  );

  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${safeUrl}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${safeTitle}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${safeDesc}" />`,
  );

  out = out.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${safeUrl}" />`,
  );

  out = out.replace(
    /<link\s+rel="alternate"\s+hreflang="nb-NO"\s+href="[^"]*"\s*\/?>/,
    `<link rel="alternate" hreflang="nb-NO" href="${safeUrl}" />`,
  );

  // Injiser H1 + intro i #root så non-JS crawlere har faktisk
  // tekstinnhold å parse.
  out = out.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><h1>${safeH1}</h1><p>${safeIntro}</p></div>`,
  );

  return out;
}

function injectSchema(html, graph) {
  const payload = {
    "@context": "https://schema.org",
    "@graph": graph,
  };
  const tag = `<script type="application/ld+json" data-prerender-route>${JSON.stringify(payload)}</script>\n  </head>`;
  return html.replace("</head>", tag);
}

let count = 0;
for (const r of ROUTES) {
  const url = `${SITE}${r.path}`;
  const html = injectSchema(
    injectMeta(SHELL, {
      title: r.title,
      description: r.description,
      url,
      h1: r.h1,
      intro: r.intro,
    }),
    r.schemaGraph(url),
  );
  const outDir = join(DIST, r.path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
  count++;
}

console.log(`[prerender] Wrote ${count} per-route HTML file${count === 1 ? "" : "s"}`);
