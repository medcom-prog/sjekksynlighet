import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/40">
      <div className="container flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Sjekksynlighet</p>
        <nav className="flex items-center gap-5">
          <Link
            to="/personvern"
            className="transition-colors hover:text-foreground"
          >
            Personvern
          </Link>
        </nav>
      </div>
    </footer>
  );
}
