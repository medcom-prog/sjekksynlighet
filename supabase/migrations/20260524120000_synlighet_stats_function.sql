-- Aggregated, anonymous stats for /api/stats.
--
-- Anon-rollen har INSERT-only på synlighet_leads (RLS), så en
-- offentlig endpoint kan ikke SELECT raw rows. Denne SECURITY
-- DEFINER-funksjonen aggregerer i Postgres og returnerer kun
-- trygge tall (ingen domener, e-poster eller kontakt-info).
--
-- Brukt av api/stats.ts som er cachet 10 min på Vercel's CDN.

CREATE OR REPLACE FUNCTION public.get_synlighet_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int;
  v_avg numeric;
  v_median numeric;
  v_first timestamptz;
  v_last timestamptz;
  v_dist jsonb;
  v_weakest jsonb;
BEGIN
  SELECT COUNT(*), ROUND(AVG(scan_score)::numeric, 1),
         MIN(created_at), MAX(created_at)
    INTO v_total, v_avg, v_first, v_last
    FROM synlighet_leads;

  IF v_total = 0 THEN
    RETURN jsonb_build_object(
      'total_scans', 0,
      'avg_score', 0,
      'median_score', 0,
      'score_distribution', jsonb_build_object('kritisk', 0, 'svak', 0, 'ok', 0, 'god', 0, 'ypperste', 0),
      'weakest_checks', '[]'::jsonb,
      'first_scan_at', null,
      'last_scan_at', null
    );
  END IF;

  SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY scan_score)
    INTO v_median
    FROM synlighet_leads;

  SELECT jsonb_build_object(
    'kritisk',  COUNT(*) FILTER (WHERE scan_score BETWEEN 0 AND 30),
    'svak',     COUNT(*) FILTER (WHERE scan_score BETWEEN 31 AND 50),
    'ok',       COUNT(*) FILTER (WHERE scan_score BETWEEN 51 AND 70),
    'god',      COUNT(*) FILTER (WHERE scan_score BETWEEN 71 AND 84),
    'ypperste', COUNT(*) FILTER (WHERE scan_score >= 85)
  )
  INTO v_dist
  FROM synlighet_leads;

  -- Topp-5 sjekker som hyppigst får under halvparten av maks-poeng
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', t.check_id,
    'below_half_pct', ROUND(100.0 * t.failed / NULLIF(t.total, 0))::int
  )), '[]'::jsonb)
  INTO v_weakest
  FROM (
    SELECT
      issue->>'id' AS check_id,
      COUNT(*) AS total,
      COUNT(*) FILTER (
        WHERE (issue->>'points')::numeric < (issue->>'maxPoints')::numeric / 2
      ) AS failed
    FROM synlighet_leads,
         jsonb_array_elements(scan_result->'issues') AS issue
    WHERE issue ? 'id' AND issue ? 'points' AND issue ? 'maxPoints'
    GROUP BY issue->>'id'
    ORDER BY (COUNT(*) FILTER (
      WHERE (issue->>'points')::numeric < (issue->>'maxPoints')::numeric / 2
    ))::numeric / NULLIF(COUNT(*), 0) DESC
    LIMIT 5
  ) t;

  RETURN jsonb_build_object(
    'total_scans', v_total,
    'avg_score', v_avg,
    'median_score', v_median,
    'score_distribution', v_dist,
    'weakest_checks', v_weakest,
    'first_scan_at', v_first,
    'last_scan_at', v_last
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_synlighet_stats() TO anon, authenticated;
