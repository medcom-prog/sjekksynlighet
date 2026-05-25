import { useEffect, useState } from "react";
import type { TocItem } from "./headingUtils";
import { cn } from "@/lib/utils";

/**
 * Sidebar table of contents. Highlighter den aktive seksjonen ved
 * scroll via IntersectionObserver. Lazy: hvis brukeren har færre
 * enn 2 headings, render ingen ToC (uunødvendig støy).
 *
 * Klikk på en ToC-lenke bruker `history.replaceState` istedenfor
 * default-anker-pushState. Det betyr at browser-back-knappen tar
 * brukeren til FORRIGE SIDE — ikke til forrige anker på samme side.
 *
 * IntersectionObserver-en plukker den ØVERSTE synlige seksjonen
 * (sortert etter boundingClientRect.top), ikke bare første som
 * krysser viewport-grensen. Det fjerner highlight-flimmer mellom
 * tilstøtende H2-er når brukeren scroller raskt.
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    if (items.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveSlug(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    const headings = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => !!el);
    for (const h of headings) observer.observe(h);
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // replaceState (ikke pushState) — back-knappen tar deg til forrige
    // side, ikke til forrige anker på samme side.
    history.replaceState(null, "", `#${slug}`);
    // Optimistisk highlight: ikke vent på IntersectionObserver
    setActiveSlug(slug);
  };

  return (
    <nav aria-label="Innholdsfortegnelse" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
        I denne artikkelen
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {items.map((item) => {
          const isActive = activeSlug === item.slug;
          return (
            <li key={item.slug} className={cn(item.level === 3 && "pl-3")}>
              <a
                href={`#${item.slug}`}
                onClick={(e) => handleClick(e, item.slug)}
                className={cn(
                  "block -ml-px border-l-2 pl-3 py-1 leading-snug transition-colors",
                  isActive
                    ? "border-accent text-accent font-medium"
                    : "border-transparent text-foreground/65 hover:text-foreground hover:border-border",
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
