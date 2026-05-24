import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { articles } from "./articles";

/**
 * Bunn-blokk på hver artikkel — 3 nyeste andre artikler.
 * Bidireksjonell internal linking lifter PageRank-flyt og AI-citation.
 */
export function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const others = articles.filter((a) => a.slug !== currentSlug).slice(0, 3);
  if (others.length === 0) return null;
  return (
    <section className="mt-16 border-t border-border pt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Mer fra Sjekksynlighet
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
        Andre artikler du kan ha glede av
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {others.map((a) => (
          <Link
            key={a.slug}
            to={`/artikler/${a.slug}`}
            className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_8px_24px_-12px_rgba(13,148,136,0.2)]"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-[15px] font-semibold leading-snug text-foreground">
                {a.title}
              </h3>
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-foreground/40 transition-colors group-hover:text-accent"
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/65 line-clamp-3">
              {a.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
