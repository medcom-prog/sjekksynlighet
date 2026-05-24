import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-accent">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Siden finnes ikke
      </h1>
      <p className="mt-3 text-pretty text-muted-foreground">
        URL-en du prøvde finnes ikke — eller har blitt flyttet. Gå tilbake
        til forsiden for å starte en synlighetscheck.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Til forsiden
        </Link>
      </Button>
    </section>
  );
}
