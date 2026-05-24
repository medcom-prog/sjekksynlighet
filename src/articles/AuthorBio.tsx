import { ExternalLink } from "lucide-react";
import type { Author } from "./authors";

/**
 * Forfatter-bio-blokk under hver artikkel. Naturlig kontekst —
 * "X jobber til daglig hos Medcom AS" — som samtidig leverer én
 * høyverdig Medcom-backlink per artikkel.
 *
 * Pattern bevisst formgitt som faglig attribusjon, IKKE som sales-
 * CTA. Folk leser dette og tenker "ah, ekspert-bakgrunn" — ikke
 * "ah, sponset innhold".
 */
export function AuthorBio({ author }: { author: Author }) {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <aside
      className="mt-12 rounded-2xl border border-border bg-card p-6"
      aria-label="Om forfatteren"
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <div
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-inset ring-accent/25"
        >
          <span className="font-display text-lg font-semibold">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
            Skrevet av
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
            {author.name}
          </h3>
          <p className="mt-0.5 text-sm text-foreground/70">{author.position}</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            {author.bio}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <a
              href={author.medcomTeamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline"
            >
              Profil hos Medcom
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            {author.linkedin && (
              <a
                href={author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/55 hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
