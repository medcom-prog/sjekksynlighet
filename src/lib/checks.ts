/**
 * Definisjon av de ti tekniske sjekkene vi kjører.
 *
 * Hver sjekk har TO versjoner av forklaringene:
 *
 *   `plain`     — for bedriftseieren som ikke kan kode. Bruker
 *                 metaforer (butikk, dør, visittkort), klartekst,
 *                 konsekvens i forretningsbegreper.
 *
 *   `technical` — for utvikleren som skal fikse det. Bruker SEO-
 *                 og web-jargong (canonical, JSON-LD, sameAs).
 *                 Vises via "Vis teknisk versjon"-toggle.
 *
 * I tillegg har hver sjekk `effort`-metadata: tid, vanskelighetsgrad,
 * sånn at bedriftseieren kan prioritere.
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

export type CheckExplanation = {
  /** Hva sjekken gjør — fra brukerens perspektiv. */
  what: string;
  /** Hvorfor det betyr noe — konsekvens for synlighet. */
  why: string;
  /** Hva som må gjøres for å fikse det. */
  howToFix: string;
};

export type CheckEffort = {
  /** "30 min", "1 time", "2 timer", "1 dag". */
  timeToFix: string;
  /** Hvem som typisk kan fikse det. */
  difficulty: "DIY" | "Utvikler" | "Strategisk";
};

export type CheckDefinition = {
  id: CheckId;
  title: string;
  plain: CheckExplanation;
  technical: CheckExplanation;
  effort: CheckEffort;
};

export const CHECK_DEFINITIONS: CheckDefinition[] = [
  {
    id: "reachable",
    title: "Nettsiden svarer (HTTP 200)",
    plain: {
      what: "Vi banker på døra og ser om noen åpner. Hvis nettsiden ikke svarer eller bruker mer enn et par sekunder, blir både Google, ChatGPT og kunder utålmodige og går videre.",
      why: "En treg eller død nettside er som en butikk med stengt skilt midt på dagen — alle som kommer forbi går videre til neste.",
      howToFix: "Sjekk at domenet er aktivt, at serveren svarer raskt, og at både eksempel.no og www.eksempel.no responderer innen et par sekunder.",
    },
    technical: {
      what: "Vi henter forsiden og verifiserer at den returnerer en gyldig 2xx-respons under to sekunder.",
      why: "Hvis siden er utilgjengelig eller treg, vil verken Google eller AI-crawlere indeksere den konsistent.",
      howToFix: "Sjekk DNS, host-konfigurasjon og at serveren responderer på både apex- og www-variant innen tre sekunder.",
    },
    effort: { timeToFix: "Varierer", difficulty: "Utvikler" },
  },
  {
    id: "meta",
    title: "Skiltet over butikken er på plass",
    plain: {
      what: "Tre ting på «skiltet» over nettsiden din: navnet (title), én linje om hva du gjør (meta description), og den «offisielle adressen» (canonical). Vi sjekker at alle tre er på plass og leselige.",
      why: "Dette er det aller første Google og ChatGPT ser. Mangler skiltet — eller står det bare «BUTIKK» — så vet ingen hvilken butikk dette er.",
      howToFix: "Be utvikleren din legge til en god title (50–60 tegn som beskriver bedriften), en meta description (140–200 tegn med tjenester og lokasjon), og en canonical-tag som peker til den faktiske URL-en.",
    },
    technical: {
      what: "Vi parser <head> og kontrollerer at title, meta description og canonical-lenken eksisterer med fornuftig lengde.",
      why: "Disse tre taggene er det første AI-modeller og søkemotorer bruker for å forstå hva siden handler om.",
      howToFix: "Legg til en <title> på 50–60 tegn, en <meta name=\"description\"> på 140–160 tegn og en <link rel=\"canonical\" href=\"https://...\"> i hver sides <head>.",
    },
    effort: { timeToFix: "30 min", difficulty: "Utvikler" },
  },
  {
    id: "schema_org",
    title: "Du har et visittkort til AI-er",
    plain: {
      what: "Et «visittkort» for nettsiden din, skrevet i et språk maskiner forstår. Vi sjekker om det finnes i det hele tatt.",
      why: "Uten visittkort må ChatGPT gjette hvem du er. Med visittkort kan den hente fakta direkte — åpningstider, adresse, tjenester — og bruke det i svar til kundene dine.",
      howToFix: "Be utvikleren din legge inn strukturert data (Schema.org JSON-LD) i nettsidens topptekst. Skal minst inneholde et Organization- og WebSite-skjema.",
    },
    technical: {
      what: "Vi teller antall <script type=\"application/ld+json\"> og parser hver blokk for å identifisere skjematyper.",
      why: "Uten strukturert data må AI-motorer gjette på hva siden er. Med JSON-LD kan de hente fakta direkte.",
      howToFix: "Legg inn et <script type=\"application/ld+json\"> i <head> med minst Organization-, WebSite- og evt. LocalBusiness-skjema. Bruk @id-baserte referanser.",
    },
    effort: { timeToFix: "1 time", difficulty: "Utvikler" },
  },
  {
    id: "key_schemas",
    title: "Visittkortet er utfylt skikkelig",
    plain: {
      what: "Hvor komplett er visittkortet? Bare navnet — eller navn + adresse + tjenester + åpningstider + FAQ? Jo mer konkret info, jo mer kan AI-er bruke deg i svar.",
      why: "Et halvt utfylt visittkort betyr at ChatGPT vet navnet ditt, men ikke kan svare på «hva tilbyr de?» eller «hvor er de?» — så den siterer konkurrenten i stedet.",
      howToFix: "Suppler grunnskjemaet med en LocalBusiness (hvis du har fysisk lokale), Service (tjenester du tilbyr), Product (varer du selger) eller FAQPage (vanlige spørsmål). Hver pillar-side bør ha sin egen FAQ.",
    },
    technical: {
      what: "Vi sjekker om Organization, WebSite og minst én av LocalBusiness / Service / Product / FAQPage er til stede.",
      why: "AI-modeller vekter siter sider tyngre når både identitet (Organization) og innhold (Service/FAQ) er tydelig markert.",
      howToFix: "Suppler Organization og WebSite med en av: LocalBusiness (fysisk bedrift), Service (tjenestebedrift), Product (vare) eller FAQPage. Hver pillar-side bør ha sin egen FAQPage.",
    },
    effort: { timeToFix: "2–4 timer", difficulty: "Utvikler" },
  },
  {
    id: "robots_ai",
    title: "AI-er står på gjestelista di",
    plain: {
      what: "Du har en gjesteliste på døra. Står ChatGPT på lista? Claude? Perplexity? Vi sjekker om de 11 store AI-tjenestene er eksplisitt «velkommen».",
      why: "Hvis du bare har sagt «Google velkommen» og ikke nevner ChatGPT, kan ChatGPT velge å la deg være i fred — og du forsvinner fra AI-svar selv om resten av siden er perfekt.",
      howToFix: "Be utvikleren din legge til en eksplisitt «Allow»-linje for hver av de 11 AI-botene i filen «robots.txt». Det er en 15-minutters jobb.",
    },
    technical: {
      what: "Vi henter /robots.txt og sjekker eksplisitt Allow for elleve AI-bots: GPTBot, ClaudeBot, OAI-SearchBot, Claude-User, PerplexityBot, Google-Extended, anthropic-ai, CCBot, Bytespider, Meta-ExternalAgent, MistralAI-User.",
      why: "Hvis disse er blokkert (eller bare implisitt tillatt via wildcard) risikerer du å være usynlig i ChatGPT, Claude, Perplexity og AI Overviews.",
      howToFix: "Legg til en eksplisitt 'User-agent: <bot>' + 'Allow: /' for hver av de elleve AI-crawlerne i public/robots.txt. Aldri Disallow / for noen av dem.",
    },
    effort: { timeToFix: "15 min", difficulty: "Utvikler" },
  },
  {
    id: "sitemap",
    title: "Du har et oppdatert kart over nettsiden",
    plain: {
      what: "Kartet over hvor alt befinner seg på nettsiden din. Vi sjekker om kartet finnes — og om det er oppdatert nylig.",
      why: "Uten kart må Google og ChatGPT vandre rundt og lete etter alle sidene dine. Mange finner de aldri. Et gammelt kart er nesten like ille — de tror nye sider ikke finnes.",
      howToFix: "Be utvikleren din sette opp et automatisk sitemap som regenereres hver gang nettsiden oppdateres, slik at det alltid er ferskt.",
    },
    technical: {
      what: "Vi henter /sitemap.xml, teller URLer og sjekker at lastmod ikke er eldre enn 180 dager.",
      why: "Et stale sitemap tyder på at filen ikke regenereres ved build — Google og AI-crawlere får ikke vite om nye sider.",
      howToFix: "Generér sitemap.xml automatisk i build-prosessen (f.eks. som prebuild-skript) slik at <lastmod> alltid reflekterer siste deploy.",
    },
    effort: { timeToFix: "1 time", difficulty: "Utvikler" },
  },
  {
    id: "llms_txt",
    title: "AI-er har en «elevator-pitch» av deg",
    plain: {
      what: "Forestill deg at ChatGPT er en travel resepsjonist med 5 sekunder per kunde. En liten fil — llms.txt — er din 5-sekunders-pitch som forteller AI-er hvem du er, uten at de må lese hele nettsiden.",
      why: "AI-modeller leser denne filen FØRST når de skal oppsummere bedriften din. Uten den må de lese hele nettsiden og kan gi opp før de skjønner hvem du er — du ender opp som «ikke nevnt» i svaret.",
      howToFix: "Be utvikleren din lage en liten tekstfil kalt llms.txt som inneholder bedriftsnavn, kort beskrivelse, tjenester, kontakt og lenker til offentlige registre. Tar typisk 1 time.",
    },
    technical: {
      what: "Vi henter /llms.txt og kontrollerer at det følger spec'en med H1, beskrivelse og strukturerte seksjoner.",
      why: "llms.txt er et nytt format der AI-modeller henter en konsis oversikt over bedriften, tjenester og lenker — perfekt for AEO.",
      howToFix: "Lag /llms.txt etter llmstxt.org-spec: H1 med bedriftsnavn, kort beskrivelse, deretter seksjoner for tjenester, kontakt og autoritet. Hold under 500 linjer.",
    },
    effort: { timeToFix: "1 time", difficulty: "Utvikler" },
  },
  {
    id: "www_redirect",
    title: "Du har én hovedinngang — ikke to",
    plain: {
      what: "Har nettsiden din én eller to «dører»? Vi sjekker om både eksempel.no og www.eksempel.no fører til samme sted — eller om du har «to butikker» som splitter kundene dine.",
      why: "Google teller «butikkstemmer». Hvis to inngangsdører telles som to ulike butikker, halveres stemmen din. Konkurrenten med én dør får full pott.",
      howToFix: "Velg én variant (vanligvis uten «www»). Be utvikleren din eller domeneleverandøren din sette opp en permanent omdirigering (301) fra den andre.",
    },
    technical: {
      what: "Vi henter begge variantene og sjekker at den ene 301-redirecter til den andre (ikke 307 og ikke begge svarer 200).",
      why: "307-redirect eller dobbel 200-respons splitter Google-equity. Schema og canonical må også peke på samme variant.",
      howToFix: "Sett opp en permanent 301-redirect fra ikke-kanonisk variant (f.eks. www → apex) i hosting-konfigurasjonen. Verifiser at canonical-tag og sameAs også bruker kanonisk URL.",
    },
    effort: { timeToFix: "15 min", difficulty: "Utvikler" },
  },
  {
    id: "same_as",
    title: "Du står oppført i offentlige registre",
    plain: {
      what: "Står du i Brønnøysund (juridisk ekte), Proff (forretningsmessig ekte), 1881 (geografisk ekte)? Vi sjekker at AI-er kan verifisere at du er en reell bedrift — ikke et spøkelse.",
      why: "AI-er stoler ikke på fremmede. Hvis de ikke finner deg i offisielle registre, antar de at du er useriøs eller midlertidig — og siterer konkurrenter som har dokumentert seg.",
      howToFix: "Be utvikleren din legge til lenker fra Organization-skjemaet til din side på brreg.no, proff.no og 1881.no — pluss LinkedIn, Facebook, Instagram der relevant.",
    },
    technical: {
      what: "Vi parser Organization-skjemaet for sameAs-array og sjekker lenker til Brønnøysund (brreg.no), Proff (proff.no) og 1881 (1881.no).",
      why: "AI-modeller bygger entity-graf for å verifisere at bedriften er reell. Norske bots har spesielt høy tillit til disse tre kildene.",
      howToFix: "Legg til 'sameAs': ['https://www.brreg.no/enhet/<orgnr>', 'https://www.proff.no/...', 'https://www.1881.no/...'] i Organization-skjemaet — pluss LinkedIn, Facebook og Instagram der relevant.",
    },
    effort: { timeToFix: "30 min", difficulty: "Utvikler" },
  },
  {
    id: "canonical_resolves",
    title: "Den «offisielle adressen» din finnes",
    plain: {
      what: "Du har sagt på siden din at den «offisielle adressen» er X. Vi sjekker om X faktisk eksisterer. Det høres opplagt ut, men mange har en gammel eller planlagt adresse stående.",
      why: "Vi har sett ekte tilfeller der den offisielle adressen pekte på et domene som aldri ble registrert. Hele SEO-arbeidet lekker da til en «død gate» — som å sende post til en feil adresse i årevis.",
      howToFix: "Be utvikleren din verifisere at canonical-tagen peker på den faktiske, levende produksjons-URL-en. Aldri sett den til en test- eller staging-adresse.",
    },
    technical: {
      what: "Vi tar canonical-tagen fra forsiden og verifiserer at URL-en faktisk svarer med 2xx (ikke NXDOMAIN eller timeout).",
      why: "Vi har sett ekte tilfeller der canonical pekte på en planlagt domeneadresse som aldri ble registrert — alt SEO-arbeid lekker da til en død URL.",
      howToFix: "Verifiser at canonical-tagen peker på den faktiske produksjons-URL-en. Aldri sett canonical til en *.vercel.app- eller staging-URL.",
    },
    effort: { timeToFix: "15 min", difficulty: "Utvikler" },
  },
];

/**
 * Hjelper for kort effort-pille (vises i IssueCard).
 * Returnerer kort tekst som «30 min · Utvikler».
 */
export function formatEffort(effort: CheckEffort): string {
  return `${effort.timeToFix} · ${effort.difficulty}`;
}
