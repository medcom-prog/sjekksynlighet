/**
 * Article-author-data for sjekksynlighet.no.
 *
 * Per Medcom team-attribution-regel: public-facing artikler attribueres
 * til Shad eller Erik — aldri Peiwast. Velg etter tema:
 *   - Shad (Markedsføringsleder): AEO / SEO / Schema / AI-mekanikk
 *   - Erik (Salgsleder):           strategi / forretningsvinkel / lansering
 *
 * Author-en driver BÅDE den synlige byline-en og Person-feltet i
 * BlogPosting-skjema. Person-skjema med worksFor → Medcom AS bygger
 * E-E-A-T-grafen AI-modeller bruker for å vekte sitering-tillit.
 *
 * Hver forfatter har én Medcom-backlink i bioen — naturlig kontekst,
 * ikke salgs-CTA. Hver artikkel = én Medcom-autoritetslenke.
 */

export interface Author {
  slug: string;
  name: string;
  position: string;
  bio: string;
  expertise: string[];
  linkedin?: string;
  medcomTeamUrl: string;
}

const SHAD: Author = {
  slug: "shad",
  name: "Shad Mohu",
  position: "Markedsføringsleder hos Medcom AS",
  bio: "Shad jobber til daglig med å bygge AI-synlighet for norske bedrifter hos Medcom. Spesialisert på AEO, schema-arkitektur og konverteringsoptimalisering.",
  expertise: [
    "Answer Engine Optimization",
    "AEO",
    "SEO",
    "Schema.org JSON-LD",
    "AI-synlighet",
    "Google AI Overviews",
    "ChatGPT-sitering",
    "Perplexity",
    "Konverteringsoptimalisering",
  ],
  linkedin: "https://www.linkedin.com/company/medcom-as",
  medcomTeamUrl: "https://www.medcom.no/team#shad",
};

const ERIK: Author = {
  slug: "erik",
  name: "Erik Santos Da Silva",
  position: "Salgsleder hos Medcom AS",
  bio: "Erik leder salg og kundepartnerskap hos Medcom. Skriver om hvordan AEO-grunnmuren oversettes til forretningsmessige resultater for norske SMB-er.",
  expertise: [
    "AEO-strategi for SMB",
    "Norske bedriftsmarkedet",
    "Lansering og go-to-market",
    "Kundeoppfølging",
    "Forretningsmodellering",
  ],
  linkedin: "https://www.linkedin.com/company/medcom-as",
  medcomTeamUrl: "https://www.medcom.no/team#erik",
};

/**
 * Article-slug → forfatter-mapping. Hvis en artikkel ikke står her,
 * faller den tilbake til DEFAULT_AUTHOR (Shad — trygt valg siden
 * mest sjekksynlighet-innhold er teknisk-faglig).
 */
const SLUG_TO_AUTHOR: Record<string, Author> = {
  // Pillar 1 + spokes (Shad — teknisk AEO-domene)
  "hva-er-aeo": SHAD,
  "aeo-vs-seo": SHAD,
  "10-vanlige-aeo-feil": SHAD,

  // Pillar 2 + spokes (Shad — sitations + ChatGPT)
  "slik-blir-sitert-av-chatgpt": SHAD,
  "quick-answer-blokker": SHAD,

  // Pillar 3 + spokes (Shad — Schema.org)
  "schema-org-for-ikke-utviklere": SHAD,
  "id-grafer-forklart": SHAD,

  // Pillar 4 + spokes (Shad — AI-crawlers)
  "robots-txt-ai-crawlere": SHAD,
  "llms-txt-standarden": SHAD,
  "ai-crawler-database": SHAD,

  // Forretningsvinkel-tema (Erik)
  "aeo-norske-bedrifter-2026": ERIK,
};

const DEFAULT_AUTHOR: Author = SHAD;

export function getAuthorBySlug(slug: string): Author {
  return SLUG_TO_AUTHOR[slug] ?? DEFAULT_AUTHOR;
}

export const ALL_AUTHORS: Author[] = [SHAD, ERIK];
