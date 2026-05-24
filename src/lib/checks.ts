/**
 * Definisjon av de ti tekniske sjekkene vi kjører.
 *
 * Hver sjekk har:
 *  - id: stabil nøkkel som matchar api/scan.ts og bruks i resultat-UI
 *  - title: kort visningsnavn på forsiden ("Hva vi sjekker")
 *  - what: hva sjekken faktisk gjør (én setning)
 *  - why: hvorfor det betyr noe for AEO/SEO (én setning)
 *  - howToFix: GENERELT hva som må til — ingen Medcom-CTA
 *
 * Disse strukturene styrer både landing-siden, resultat-sidens issue-
 * kort og llms.txt-beskrivelsen av tjenesten.
 */

export type CheckId =
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

export type CheckDefinition = {
  id: CheckId;
  title: string;
  what: string;
  why: string;
  howToFix: string;
};

export const CHECK_DEFINITIONS: CheckDefinition[] = [
  {
    id: "reachable",
    title: "Nettsiden svarer (HTTP 200)",
    what: "Vi henter forsiden og verifiserer at den returnerer en gyldig 2xx-respons under to sekunder.",
    why: "Hvis siden er utilgjengelig eller treg, vil verken Google eller AI-crawlere indeksere den konsistent.",
    howToFix: "Sjekk DNS, host-konfigurasjon og at serveren responderer på både apex- og www-variant innen tre sekunder.",
  },
  {
    id: "meta",
    title: "Title, meta description og canonical",
    what: "Vi parser <head> og kontrollerer at title, meta description og canonical-lenken eksisterer med fornuftig lengde.",
    why: "Disse tre taggene er det første AI-modeller og søkemotorer bruker for å forstå hva siden handler om.",
    howToFix: "Legg til en <title> på 50–60 tegn, en <meta name=\"description\"> på 140–160 tegn og en <link rel=\"canonical\" href=\"https://...\"> i hver sides <head>.",
  },
  {
    id: "schema_org",
    title: "Schema.org JSON-LD finnes",
    what: "Vi teller antall <script type=\"application/ld+json\"> og parser hver blokk for å identifisere skjematyper.",
    why: "Uten strukturert data må AI-motorer gjette på hva siden er. Med JSON-LD kan de hente fakta direkte.",
    howToFix: "Legg inn et <script type=\"application/ld+json\"> i <head> med minst Organization-, WebSite- og evt. LocalBusiness-skjema. Bruk @id-baserte referanser.",
  },
  {
    id: "key_schemas",
    title: "Viktige skjema-typer er dekket",
    what: "Vi sjekker om Organization, WebSite og minst én av LocalBusiness / Service / Product / FAQPage er til stede.",
    why: "AI-modeller vekter siter sider tyngre når både identitet (Organization) og innhold (Service/FAQ) er tydelig markert.",
    howToFix: "Suppler Organization og WebSite med en av: LocalBusiness (fysisk bedrift), Service (tjenestebedrift), Product (vare) eller FAQPage. Hver pillar-side bør ha sin egen FAQPage.",
  },
  {
    id: "robots_ai",
    title: "robots.txt slipper inn AI-crawlere",
    what: "Vi henter /robots.txt og sjekker eksplisitt Allow for elleve AI-bots: GPTBot, ClaudeBot, OAI-SearchBot, Claude-User, PerplexityBot, Google-Extended, anthropic-ai, CCBot, Bytespider, Meta-ExternalAgent, MistralAI-User.",
    why: "Hvis disse er blokkert (eller bare implisitt tillatt via wildcard) risikerer du å være usynlig i ChatGPT, Claude, Perplexity og AI Overviews.",
    howToFix: "Legg til en eksplisitt 'User-agent: <bot>' + 'Allow: /' for hver av de elleve AI-crawlerne i public/robots.txt. Aldri Disallow / for noen av dem.",
  },
  {
    id: "sitemap",
    title: "sitemap.xml er ferskt og komplett",
    what: "Vi henter /sitemap.xml, teller URLer og sjekker at lastmod ikke er eldre enn 180 dager.",
    why: "Et stale sitemap tyder på at filen ikke regenereres ved build — Google og AI-crawlere får ikke vite om nye sider.",
    howToFix: "Generér sitemap.xml automatisk i build-prosessen (f.eks. som prebuild-skript) slik at <lastmod> alltid reflekterer siste deploy.",
  },
  {
    id: "llms_txt",
    title: "llms.txt finnes",
    what: "Vi henter /llms.txt og kontrollerer at det følger spec'en med H1, beskrivelse og strukturerte seksjoner.",
    why: "llms.txt er et nytt format der AI-modeller henter en konsis oversikt over bedriften, tjenester og lenker — perfekt for AEO.",
    howToFix: "Lag /llms.txt etter llmstxt.org-spec: H1 med bedriftsnavn, kort beskrivelse, deretter seksjoner for tjenester, kontakt og autoritet. Hold under 500 linjer.",
  },
  {
    id: "www_redirect",
    title: "Apex og www peker konsekvent (301)",
    what: "Vi henter begge variantene og sjekker at den ene 301-redirecter til den andre (ikke 307 og ikke begge svarer 200).",
    why: "307-redirect eller dobbel 200-respons splitter Google-equity. Schema og canonical må også peke på samme variant.",
    howToFix: "Sett opp en permanent 301-redirect fra ikke-kanonisk variant (f.eks. www → apex) i hosting-konfigurasjonen. Verifiser at canonical-tag og sameAs også bruker kanonisk URL.",
  },
  {
    id: "same_as",
    title: "sameAs lenker til norske autoritetskilder",
    what: "Vi parser Organization-skjemaet for sameAs-array og sjekker lenker til Brønnøysund (brreg.no), Proff (proff.no) og 1881 (1881.no).",
    why: "AI-modeller bygger entity-graf for å verifisere at bedriften er reell. Norske bots har spesielt høy tillit til disse tre kildene.",
    howToFix: "Legg til 'sameAs': ['https://www.brreg.no/enhet/<orgnr>', 'https://www.proff.no/...', 'https://www.1881.no/...'] i Organization-skjemaet — pluss LinkedIn, Facebook og Instagram der relevant.",
  },
  {
    id: "canonical_resolves",
    title: "Canonical-URL resolver",
    what: "Vi tar canonical-tagen fra forsiden og verifiserer at URL-en faktisk svarer med 2xx (ikke NXDOMAIN eller timeout).",
    why: "Vi har sett ekte tilfeller der canonical pekte på en planlagt domeneadresse som aldri ble registrert — alt SEO-arbeid lekker da til en død URL.",
    howToFix: "Verifiser at canonical-tagen peker på den faktiske produksjons-URL-en. Aldri sett canonical til en *.vercel.app- eller staging-URL.",
  },
];
