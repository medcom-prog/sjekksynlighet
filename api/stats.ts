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
 * synlighet_leads gir anon-key INSERT-only, så vi kaller en
 * SECURITY DEFINER-funksjon (`get_synlighet_stats`) som
 * aggregerer i Postgres og kun returnerer trygge tall.
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

    // Anon-rollen har INSERT-only på synlighet_leads (RLS). En
    // SECURITY DEFINER-funksjon i Postgres aggregerer trygt og
    // returnerer kun anonyme tall vi har lov til å eksponere.
    const { data, error } = await supabase.rpc("get_synlighet_stats");

    if (error) {
      console.error("[stats] rpc error", error);
      return jsonResponse<StatsError>(res, 502, {
        ok: false,
        error: "Database query failed",
      });
    }

    const raw = data as {
      total_scans: number;
      avg_score: number;
      median_score: number;
      score_distribution: {
        kritisk: number;
        svak: number;
        ok: number;
        god: number;
        ypperste: number;
      };
      weakest_checks: Array<{ id: string; below_half_pct: number }>;
      first_scan_at: string | null;
      last_scan_at: string | null;
    } | null;

    if (!raw || raw.total_scans === 0) {
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

    const response: StatsResponse = {
      ok: true,
      generated_at: new Date().toISOString(),
      total_scans: raw.total_scans,
      avg_score: Number(raw.avg_score),
      median_score: Number(raw.median_score),
      score_distribution: raw.score_distribution,
      weakest_checks: raw.weakest_checks ?? [],
      first_scan_at: raw.first_scan_at,
      last_scan_at: raw.last_scan_at,
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
