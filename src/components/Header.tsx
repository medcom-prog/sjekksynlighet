import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Wordmark } from "./Wordmark";
import { cn } from "@/lib/utils";

export function Header() {
  // Subtil border bare etter scroll — på toppen flyter headeren rent
  // inn i hero-gradienten, mens etter scroll får man en tydeligere
  // separasjon mellom innhold og navigasjon.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65",
        "transition-[box-shadow,border-color] duration-200",
        scrolled
          ? "border-b border-border/60 shadow-[0_1px_0_rgba(0,0,0,0.02),0_4px_16px_-12px_rgba(15,20,25,0.18)]"
          : "border-b border-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link
          to="/"
          className="rounded-md text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Sjekksynlighet — gå til forsiden"
        >
          <Wordmark iconClassName="text-accent" />
        </Link>
        <nav aria-label="Hovedmeny" className="flex items-center gap-1 text-sm">
          <NavLink
            to="/personvern"
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-2 transition-colors",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            Personvern
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
