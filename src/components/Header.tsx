import { Link } from "react-router-dom";
import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="text-foreground transition-colors hover:text-accent rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Sjekksynlighet — gå til forsiden"
        >
          <Wordmark iconClassName="text-accent" />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/personvern"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Personvern
          </Link>
        </nav>
      </div>
    </header>
  );
}
