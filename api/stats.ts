/**
 * /api/stats — offentlig endpoint for aggregert anonymisert
 * scan-data fra synlighet_leads.
 *
 * Fundament for cross-citation-strategien: når vi har 500+ scans
 * kan vi publisere "stats"-artikler som medcom.no kan sitere som
 * autoritativ kilde. Endpointet er offentlig så journalister,
 * andre SEO-folk og AI-modeller kan hente tallene direkte.
 *
 * Cache: 10 minutter via stale-while-revalidate. Lett spørring,
 * men ingen vits å hammer Postgres for noe som endrer seg sakte.
 *
 * Personvern: returnerer KUN aggregert data. Aldri individuelle
 * domener, e-poster eller kontakt-info. RLS-policyen på
 * synlighet_leads forhindrer det også, men anon-key brukt her
 * får uansett ikke SELECT — vi bruker service_role internt.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type StatsResponse = {
  ok: true;
  generated_at: string;
  total_scans: number;
  avg_score: number;
  median_score: number;
  score_distribution: {
    kritisk: number; // 0-30
    svak: number; // 31-50
    ok: number; // 51-70
    god: number; // 71-84
    ypperste: number; // 85-100
  };
  /** Topp-5 ID-er for sjekker som hyppigst får under 5/10 */
  weakest_checks: Array<{ id: string; below_half_pct: number }>;
  first_scan_at: string | null;
  last_scan_at: string | null;
  note: string;
};

type StatsError = { ok: false; error: string };

function jsonResponse<T>(res: VercelResponse, status: number, body: T, cacheSec = 0) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader(
    "Cache-Control",
    cacheSec > 0
      ? `public, max-age=${cacheSec}, s-maxage=${cacheSec}, stale-while-revalidate=${cacheSec * 6}`
      : "no-store",
  );
  res.status(status).send(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return jsonResponse(res, 204, null);
  }
  if (req.method !== "GET") {
    return jsonResponse<StatsError>(res, 405, {
      ok: false,
      error: "Method Not Allowed",
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse<StatsError>(res, 500, {
      ok: false,
      error: "Server not configured",
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Hent scan_score + scan_result for hver lead. Vi aggregerer
    // alt i kode istedenfor SQL — total dataset er typisk lite (få
    // tusen rader) og fleksibiliteten er verdt litt mer compute.
    const { data, error } = await supabase
      .from("synlighet_leads")
      .select("scan_score, scan_result, created_at, last_scan_at");

    if (error) {
      console.error("[stats] supabase select error", error);
      return jsonResponse<StatsError>(res, 502, {
        ok: false,
        error: "Database query failed",
      });
    }

    const rows = (data ?? []) as Array<{
      scan_score: number;
      scan_result: { issues?: Array<{ id: string; points: number; maxPoints: number }> };
      created_at: string;
      last_scan_at?: string;
    }>;

    const totalScans = rows.length;

    if (totalScans === 0) {
      return jsonResponse<StatsResponse>(
        res,
        200,
        {
          ok: true,
          generated_at: new Date().toISOString(),
          total_scans: 0,
          avg_score: 0,
          median_score: 0,
          score_distribution: { kritisk: 0, svak: 0, ok: 0, god: 0, ypperste: 0 },
          weakest_checks: [],
          first_scan_at: null,
          last_scan_at: null,
          note: "Ingen scans ennå — kom tilbake snart.",
        },
        60,
      );
    }

    const scores = rows.map((r) => r.scan_score).sort((a, b) => a - b);
    const sum = scores.reduce((s, x) => s + x, 0);
    const avg = sum / scores.length;
    const median =
      scores.length % 2 === 0
        ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
        : scores[Math.floor(scores.length / 2)];

    const dist = { kritisk: 0, svak: 0, ok: 0, god: 0, ypperste: 0 };
    for (const s of scores) {
      if (s >= 85) dist.ypperste++;
      else if (s >= 71) dist.god++;
      else if (s >= 51) dist.ok++;
      else if (s >= 31) dist.svak++;
      else dist.kritisk++;
    }

    // For hver sjekk-id: hvor stor andel av scans får < halv-maks?
    const checkFailCounts: Record<string, { failed: number; total: number }> = {};
    for (const r of rows) {
      const issues = r.scan_result?.issues ?? [];
      for (const i of issues) {
        const k = i.id;
        if (!checkFailCounts[k]) checkFailCounts[k] = { failed: 0, total: 0 };
        checkFailCounts[k].total++;
        if (i.points < i.maxPoints / 2) checkFailCounts[k].failed++;
      }
    }
    const weakest = Object.entries(checkFailCounts)
      .map(([id, { failed, total }]) => ({
        id,
        below_half_pct: Math.round((failed / total) * 100),
      }))
      .sort((a, b) => b.below_half_pct - a.below_half_pct)
      .slice(0, 5);

    const dates = rows
      .map((r) => r.created_at)
      .filter(Boolean)
      .sort();

    const response: StatsResponse = {
      ok: true,
      generated_at: new Date().toISOString(),
      total_scans: totalScans,
      avg_score: Math.round(avg * 10) / 10,
      median_score: Math.round(median * 10) / 10,
      score_distribution: dist,
      weakest_checks: weakest,
      first_scan_at: dates[0] ?? null,
      last_scan_at: dates[dates.length - 1] ?? null,
      note: "Aggregert anonymisert data fra synlighet_leads. Oppdateres hvert tiende minutt.",
    };

    return jsonResponse(res, 200, response, 600);
  } catch (err) {
    console.error("[stats] threw", err);
    return jsonResponse<StatsError>(res, 500, {
      ok: false,
      error: "Internal error",
    });
  }
}
