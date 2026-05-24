import { useEffect, useState } from "react";
import type { TocItem } from "./headingUtils";
import { cn } from "@/lib/utils";

/**
 * Sidebar table of contents. Highlighter den aktive seksjonen ved
 * scroll via IntersectionObserver. Lazy: hvis brukeren har færre
 * enn 2 headings, render ingen ToC (uunødvendig støy).
 */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    if (items.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0% -60% 0%" },
    );
    const headings = items
      .map((i) => document.getElementById(i.slug))
      .filter((el): el is HTMLElement => !!el);
    for (const h of headings) observer.observe(h);
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Innholdsfortegnelse" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">
        I denne artikkelen
      </p>
      <ul className="space-y-2 border-l border-border pl-4">
        {items.map((item) => (
          <li
            key={item.slug}
            className={cn(item.level === 3 && "pl-3")}
          >
            <a
              href={`#${item.slug}`}
              className={cn(
                "block leading-snug transition-colors",
                activeSlug === item.slug
                  ? "text-accent font-medium"
                  : "text-foreground/65 hover:text-foreground",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
