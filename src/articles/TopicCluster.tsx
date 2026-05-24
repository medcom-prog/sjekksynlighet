import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { articles } from "./articles";
import { getClusterForSlug, isPillar } from "./topics";

/**
 * Hub-and-spoke navigasjons-blokk. Vises på hver artikkel som hører
 * til en topic-cluster. Pillar lenker til alle spokes, hver spoke
 * lenker tilbake til pillar — bidireksjonell internal linking som
 * AI-motorer bruker til å finne autoritetshub-en for et tema.
 */
export function TopicCluster({ currentSlug }: { currentSlug: string }) {
  const cluster = getClusterForSlug(currentSlug);
  if (!cluster) return null;

  const allSlugs = [cluster.pillarSlug, ...cluster.supportingSlugs];
  const items = allSlugs
    .filter((s) => s !== currentSlug)
    .map((s) => articles.find((a) => a.slug === s))
    .filter((a): a is NonNullable<typeof a> => !!a);

  if (items.length === 0) return null;
  const onPillar = isPillar(currentSlug);

  return (
    <section className="mt-12 rounded-2xl border border-accent/15 bg-accent/[0.03] p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Compass className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {onPillar ? "Spokes i dette temaet" : "Hører til tema"}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
            {cluster.name}
          </h3>
          <p className="mt-1 text-sm text-foreground/65">{cluster.description}</p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {items.map((a) => (
              <li key={a.slug}>
                <Link
                  to={`/artikler/${a.slug}`}
                  className="inline-flex items-center gap-2 text-accent hover:underline"
                >
                  {a.slug === cluster.pillarSlug && (
                    <span className="inline-flex items-center rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent ring-1 ring-inset ring-accent/20">
                      Pillar
                    </span>
                  )}
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
