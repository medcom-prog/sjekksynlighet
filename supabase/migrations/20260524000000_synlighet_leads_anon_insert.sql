-- Tillat anon-rollen å INSERT-e leads via /api/scan-funksjonen.
--
-- Funksjonen kjører server-side med anon-nøkkelen og passer på
-- rate-limit + IP-hash før innsetting. RLS er andre forsvarslag:
-- anon-rollen kan kun INSERT, ikke SELECT/UPDATE/DELETE. Service_role
-- er bevart for backend-administrasjon via Medcom-portalen og lese-
-- tilgang via authenticated.
--
-- Applied via Supabase MCP — denne filen er kun historisk dokumentasjon.
DROP POLICY IF EXISTS "anon insert leads" ON synlighet_leads;
CREATE POLICY "anon insert leads" ON synlighet_leads
  FOR INSERT TO anon
  WITH CHECK (
    scan_score BETWEEN 0 AND 100
    AND length(domain) BETWEEN 3 AND 253
    AND length(email) BETWEEN 5 AND 320
    AND status = 'new'
  );

COMMENT ON POLICY "anon insert leads" ON synlighet_leads IS
  'Anon-rollen kan kun INSERT, ikke lese eller endre. CHECK-en blokkerer åpenbart misbruk (negative scores, tom domain/email, eskalering av status).';
