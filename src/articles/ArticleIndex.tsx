import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Compass } from "lucide-react";
import { MetaHead } from "./MetaHead";
import { articles } from "./articles";
import { TOPIC_CLUSTERS, getClusterForSlug } from "./topics";
import { FadeUp } from "@/components/FadeUp";

/**
 * /artikler — index over alle artikler, gruppert per topic-cluster.
 *
 * Bevisst gruppering istedenfor flat liste: AI-motorer som indekserer
 * denne siden ser pillar→spoke-relasjonen direkte i markup. Også
 * lettere for menneske-brukere å navigere kunnskapen.
 */
export default function ArticleIndex() {
  const canonical =
    typeof window !== "undefined" ? `${window.location.origin}/artikler` : undefined;

  // Artikler som ikke er tilordnet en cluster vises i en "Andre"-seksjon
  const orphanArticles = articles.filter((a) => !getClusterForSlug(a.slug));

  return (
    <>
      <MetaHead
        title="Artikler — AEO og AI-synlighet forklart"
        description="Praktisk kunnskap om Answer Engine Optimization, schema.org, AI-crawlere og hvordan norske bedrifter blir sitert av ChatGPT, Gemini og Perplexity."
        canonical={canonical}
      />

      <section className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <FadeUp immediate as="header" className="mb-12 flex flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-inset ring-accent/25 text-accent">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            <span aria-hidden className="inline-block h-px w-6 align-middle bg-accent/40 mr-2" />
            Kunnskap
            <span aria-hidden className="inline-block h-px w-6 align-middle bg-accent/40 ml-2" />
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Slik fungerer AI-synlighet
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-foreground/70">
            Vi sjekker ti tekniske AEO-signaler. Her forklarer vi hva de er,
            hvorfor de teller, og hvordan du fikser dem — uten teknisk-prat.
          </p>
        </FadeUp>

        {articles.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Topic-cluster-grupperte artikler */}
            {TOPIC_CLUSTERS.map((cluster) => {
              const items = [cluster.pillarSlug, ...cluster.supportingSlugs]
                .map((s) => articles.find((a) => a.slug === s))
                .filter((a): a is NonNullable<typeof a> => !!a);
              if (items.length === 0) return null;
              return (
                <div key={cluster.slug} className="mb-14">
                  <FadeUp className="mb-5 flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/20">
                      <Compass className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                        {cluster.name}
                      </h2>
                      <p className="mt-1 text-sm text-foreground/65">
                        {cluster.description}
                      </p>
                    </div>
                  </FadeUp>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((a, i) => (
                      <FadeUp key={a.slug} delay={i * 70 + 100}>
                        <ArticleCard article={a} isPillar={a.slug === cluster.pillarSlug} />
                      </FadeUp>
                    ))}
                  </div>
                </div>
              );
            })}

            {orphanArticles.length > 0 && (
              <div className="mb-14">
                <FadeUp as="h2" className="mb-5 font-display text-xl font-semibold tracking-tight">
                  Andre artikler
                </FadeUp>
                <div className="grid gap-4 sm:grid-cols-2">
                  {orphanArticles.map((a, i) => (
                    <FadeUp key={a.slug} delay={i * 70 + 100}>
                      <ArticleCard article={a} />
                    </FadeUp>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

function ArticleCard({
  article,
  isPillar,
}: {
  article: { slug: string; title: string; excerpt: string; published_at?: string };
  isPillar?: boolean;
}) {
  return (
    <Link
      to={`/artikler/${article.slug}`}
      className="group relative block rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_8px_24px_-12px_rgba(13,148,136,0.2)]"
    >
      {isPillar && (
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent ring-1 ring-inset ring-accent/20">
          Pillar
        </span>
      )}
      <h3 className="font-display text-base font-semibold leading-snug text-foreground pr-16">
        {article.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/65 line-clamp-3">
        {article.excerpt}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-foreground/55">
        {article.published_at && (
          <span>
            {new Date(article.published_at).toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        )}
        <ArrowUpRight
          aria-hidden
          className="h-4 w-4 text-foreground/40 transition-colors group-hover:text-accent"
        />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center">
      <p className="font-medium text-foreground">Ingen artikler ennå</p>
      <p className="mt-1 text-sm text-foreground/65">
        Vi publiserer fortløpende — kom tilbake snart.
      </p>
    </div>
  );
}
