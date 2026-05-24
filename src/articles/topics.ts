/**
 * Topical clustering for sjekksynlighet-artikler.
 *
 * Hub-and-spoke internal linking. AI-motorer (ChatGPT, Perplexity,
 * Google AI Overviews) bruker site-en's interne lenke-graf til å
 * finne ut hvilken side som er autoritativ hub for et tema.
 * Bidireksjonell lenking pillar↔spoke hever AI-sitering-rate fra
 * ~12 % til ~41 % per industri-data (2026).
 *
 * Hver cluster har én pillar (bredeste, mest evergreen artikkel) og
 * N supporting "spokes" som lenker tilbake til pillaren.
 */

export interface TopicCluster {
  /** Stable identifier brukt i URL-params + about-schema */
  slug: string;
  /** Lesbar navn vist i UI + about-skjema */
  name: string;
  /** Kort beskrivelse for cluster-headers og oversiktssider */
  description: string;
  /** Pillar-artikkelens slug — sentral, autoritativ */
  pillarSlug: string;
  /** Spoke-artikkelenes slugs */
  supportingSlugs: string[];
}

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    slug: "aeo-grunnlag",
    name: "Hva AEO er — og hvorfor det betyr noe",
    description:
      "Svarmotorer som ChatGPT, Gemini og Perplexity siterer kilder annerledes enn klassisk Google. Her er det grunnleggende du må forstå.",
    pillarSlug: "hva-er-aeo",
    supportingSlugs: ["aeo-vs-seo", "aeo-norske-bedrifter-2026", "10-vanlige-aeo-feil"],
  },
  {
    slug: "ai-sitering",
    name: "Slik blir du sitert av AI-motorer",
    description:
      "Praktiske grep som faktisk gjør at ChatGPT og Gemini plukker bedriften din når kundene spør.",
    pillarSlug: "slik-blir-sitert-av-chatgpt",
    supportingSlugs: ["quick-answer-blokker"],
  },
  {
    slug: "schema-grunnmur",
    name: "Schema.org — visittkortet maskinene leser",
    description:
      "Strukturert data uten utvikler-jargong. Hvordan du faktisk får det riktig.",
    pillarSlug: "schema-org-for-ikke-utviklere",
    supportingSlugs: ["id-grafer-forklart"],
  },
  {
    slug: "ai-crawlere",
    name: "AI-crawlere — hvem bør slippe inn på siden din",
    description:
      "robots.txt og llms.txt — hva de er, hvorfor de teller, og hvordan du setter dem opp riktig.",
    pillarSlug: "robots-txt-ai-crawlere",
    supportingSlugs: ["llms-txt-standarden", "ai-crawler-database"],
  },
];

export function getClusterForSlug(slug: string): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find(
    (c) => c.pillarSlug === slug || c.supportingSlugs.includes(slug),
  );
}

export function isPillar(slug: string): boolean {
  return TOPIC_CLUSTERS.some((c) => c.pillarSlug === slug);
}

/** Alle slugs i cluster-en, EKSKLUDERT current slug. */
export function getClusterSiblings(slug: string): string[] {
  const cluster = getClusterForSlug(slug);
  if (!cluster) return [];
  return [cluster.pillarSlug, ...cluster.supportingSlugs].filter((s) => s !== slug);
}
