import { Link } from "react-router-dom";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border/60 bg-white/60 backdrop-blur">
      <div className="container py-10">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr] sm:gap-10">
          <div className="flex flex-col gap-3">
            <Wordmark iconClassName="text-accent" className="text-foreground" />
            <p className="max-w-md text-sm leading-relaxed text-foreground/65">
              Gratis, nøytralt verktøy for å måle hvor synlig en nettside er
              for moderne AI-svarmotorer og klassisk Google-søk.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
              Operatør
            </p>
            <p className="text-foreground/70">
              Medcom AS · org.nr 936 155 731
              <br />
              <span className="text-foreground/55">
                Behandlingsansvarlig etter GDPR — se{" "}
                <Link
                  to="/personvern"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  personvernerklæringen
                </Link>
                .
              </span>
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Sjekksynlighet · Alle rettigheter forbeholdt</p>
          <nav aria-label="Footer-meny" className="flex items-center gap-5">
            <Link
              to="/personvern"
              className="transition-colors hover:text-foreground"
            >
              Personvern
            </Link>
            <a
              href="mailto:hei@sjekksynlighet.no"
              className="transition-colors hover:text-foreground"
            >
              hei@sjekksynlighet.no
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
