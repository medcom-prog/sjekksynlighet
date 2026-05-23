-- Lead-pipeline for sjekksynlighet.no
--
-- En lead opprettes hver gang noen kjører en gratis synlighetscheck.
-- Medcom-teamet følger opp manuelt fra portalen (status flippes
-- new → contacted → won/lost/no_response).
--
-- Tabellen lever i medcom-as-prosjektet (bhwzzzzqxhejuqfpzejd) sammen
-- med clients + profiles, slik at konverterte leads kan refereres til
-- via converted_to_client_id og assigned_to peker på profiles(id).
--
-- Applied via Supabase MCP — denne filen er kun for historisk
-- sporing, ikke source-of-truth (jf. medcom-portal CLAUDE.md).
CREATE TABLE IF NOT EXISTS synlighet_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  email text NOT NULL,
  phone text,
  name text,
  firma text,
  scan_score int NOT NULL,
  scan_result jsonb NOT NULL,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','won','lost','no_response')),
  notes text,
  assigned_to uuid REFERENCES profiles(id),
  converted_to_client_id uuid REFERENCES clients(id),
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  contacted_at timestamptz
);

CREATE INDEX IF NOT EXISTS synlighet_leads_status_idx
  ON synlighet_leads(status);

CREATE INDEX IF NOT EXISTS synlighet_leads_created_idx
  ON synlighet_leads(created_at DESC);

ALTER TABLE synlighet_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role full" ON synlighet_leads;
CREATE POLICY "service_role full" ON synlighet_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated read" ON synlighet_leads;
CREATE POLICY "authenticated read" ON synlighet_leads
  FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE synlighet_leads IS 'Leads samlet inn via sjekksynlighet.no — gratis AEO-synlighetscheck.';
COMMENT ON COLUMN synlighet_leads.scan_result IS 'Full ScanResponse JSON: { ok, scanId, score, tier, domain, scannedAt, issues[] }';
COMMENT ON COLUMN synlighet_leads.ip_hash IS 'SHA256(salt:ip), kun for rate-limit + misbruks-deteksjon. Råverdier lagres aldri.';
COMMENT ON COLUMN synlighet_leads.converted_to_client_id IS 'Settes når lead konverteres til kunde i clients-tabellen — fungerer som attribusjon for verktøyet.';
