-- Re-scan support: en bruker som scanner samme (email, domain) flere ganger
-- skal oppdatere eksisterende lead, ikke lage duplikater. Status og Medcom-
-- team-felter preserveres alltid.
--
-- Applied via Supabase MCP — denne filen er historisk dokumentasjon.

-- 1) Track antall scans + tidspunkt for siste scan
ALTER TABLE synlighet_leads
  ADD COLUMN IF NOT EXISTS scan_count int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_scan_at timestamptz NOT NULL DEFAULT now();

-- 2) Upsert-funksjon — eneste måten anon kan oppdatere eksisterende leads.
--    SECURITY DEFINER låser kolonne-tilgang: anon kan KUN endre scan-
--    relaterte felter, aldri status/notes/assigned_to/converted_to_client_id.
--    COALESCE-mønsteret betyr at hvis brukeren skanner igjen UTEN telefon
--    så preserveres telefonen fra første scan (vi mister aldri kontakt-data).
CREATE OR REPLACE FUNCTION upsert_synlighet_scan(
  p_id uuid,
  p_domain text,
  p_email text,
  p_phone text,
  p_name text,
  p_firma text,
  p_scan_score int,
  p_scan_result jsonb,
  p_user_agent text,
  p_ip_hash text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_returned_id uuid;
BEGIN
  IF p_scan_score < 0 OR p_scan_score > 100 THEN
    RAISE EXCEPTION 'scan_score must be 0-100';
  END IF;
  IF length(p_email) < 5 OR length(p_email) > 320 THEN
    RAISE EXCEPTION 'invalid email length';
  END IF;
  IF length(p_domain) < 3 OR length(p_domain) > 253 THEN
    RAISE EXCEPTION 'invalid domain length';
  END IF;

  SELECT id INTO v_existing_id
  FROM synlighet_leads
  WHERE lower(email) = lower(p_email)
    AND lower(domain) = lower(p_domain)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NULL THEN
    INSERT INTO synlighet_leads (
      id, domain, email, phone, name, firma,
      scan_score, scan_result, user_agent, ip_hash,
      status, scan_count, last_scan_at
    ) VALUES (
      p_id, lower(p_domain), lower(p_email), p_phone, p_name, p_firma,
      p_scan_score, p_scan_result, p_user_agent, p_ip_hash,
      'new', 1, now()
    )
    RETURNING id INTO v_returned_id;
  ELSE
    UPDATE synlighet_leads SET
      scan_score = p_scan_score,
      scan_result = p_scan_result,
      user_agent = COALESCE(p_user_agent, user_agent),
      ip_hash = COALESCE(p_ip_hash, ip_hash),
      phone = COALESCE(phone, p_phone),
      name = COALESCE(name, p_name),
      firma = COALESCE(firma, p_firma),
      scan_count = scan_count + 1,
      last_scan_at = now()
    WHERE id = v_existing_id
    RETURNING id INTO v_returned_id;
  END IF;

  RETURN v_returned_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_synlighet_scan TO anon;
GRANT EXECUTE ON FUNCTION upsert_synlighet_scan TO authenticated;

COMMENT ON FUNCTION upsert_synlighet_scan IS
  'Upsert en synlighet-lead. Match på (email, domain) — eksisterende lead får oppdatert score + nyttig metadata, men status/notes/assigned_to preserveres alltid.';

CREATE INDEX IF NOT EXISTS synlighet_leads_email_domain_idx
  ON synlighet_leads(lower(email), lower(domain));
