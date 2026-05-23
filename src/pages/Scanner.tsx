import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CHECK_DEFINITIONS } from "@/lib/checks";
import { cacheScan, type ScanResponse, type ScanError } from "@/lib/scan";
import { Progress } from "@/components/ui/progress";
import type { ScanFormValues } from "@/components/ScanForm";

const STEP_INTERVAL_MS = 1100;

export default function Scanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ScanFormValues | null;

  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!state || !state.domain || !state.email) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

    // Cosmetic stepper: vandre gjennom de 10 sjekkene mens vi venter
    // på serveren. Server gir ikke streaming-progress; dette er ærlig
    // i den forstand at sjekkene faktisk kjører parallelt på serveren
    // og brukeren får et visuelt holdepunkt.
    const interval = setInterval(() => {
      setStepIdx((i) => (i + 1 < CHECK_DEFINITIONS.length ? i + 1 : i));
    }, STEP_INTERVAL_MS);

    (async () => {
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });
        const data = (await res.json()) as ScanResponse | ScanError;
        if (cancelled) return;

        if (!data.ok) {
          if (data.error === "rate_limited") {
            toast.error("Du har kjørt mange sjekker fra denne IP-en. Prøv igjen om en stund.");
          } else if (data.error === "invalid_domain") {
            toast.error("Domenet kunne ikke verifiseres. Sjekk skrivemåten.");
          } else if (data.error === "fetch_failed") {
            toast.error("Vi fikk ikke kontakt med nettsiden. Sjekk at domenet er live.");
          } else {
            toast.error("Noe gikk galt. Prøv igjen.");
          }
          navigate("/", { replace: true, state });
          return;
        }

        // Hold loadingen i minimum ~3 s for å unngå jarringly raskt skift
        // når et raskt API-respons treffer den friske animasjonen.
        const elapsed = Date.now() - startedAt.current;
        const minHold = 3000;
        const remaining = Math.max(0, minHold - elapsed);
        setTimeout(() => {
          if (cancelled) return;
          cacheScan(data);
          setDone(true);
          // Liten finale-pause så den siste sjekken får animere ferdig
          setTimeout(() => {
            navigate(`/resultat?id=${encodeURIComponent(data.scanId)}`, {
              replace: true,
            });
          }, 400);
        }, remaining);
      } catch (err) {
        if (cancelled) return;
        console.error("[scanner] scan failed", err);
        toast.error("Vi fikk en nettverksfeil under sjekken. Prøv igjen.");
        navigate("/", { replace: true, state });
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [navigate, state]);

  const visibleIdx = done ? CHECK_DEFINITIONS.length - 1 : stepIdx;
  const progressValue = done
    ? 100
    : Math.min(
        95,
        Math.round(((visibleIdx + 1) / CHECK_DEFINITIONS.length) * 95),
      );

  return (
    <section className="container mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-0 -m-6 animate-pulse-soft rounded-full bg-accent/15 blur-2xl"
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
        </div>
      </div>

      <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {done ? "Ferdig! Sender deg videre …" : "Vi analyserer nettsiden din"}
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        {done
          ? "Resultatet er klart. Du blir sendt videre om et øyeblikk."
          : "Dette tar normalt 8–20 sekunder. Vi kjører ti parallelle sjekker mot domenet ditt."}
      </p>

      <div className="mt-10 w-full">
        <Progress value={progressValue} aria-label="Fremdrift" />
      </div>

      <ul className="mt-8 w-full text-left">
        {CHECK_DEFINITIONS.map((c, i) => {
          const isCurrent = !done && i === visibleIdx;
          const isPast = i < visibleIdx || done;
          return (
            <li
              key={c.id}
              className={`flex items-center gap-3 border-b border-border/60 py-3 text-sm transition-opacity last:border-b-0 ${
                isPast || isCurrent ? "opacity-100" : "opacity-50"
              }`}
            >
              <CheckMarker state={done ? "done" : isPast ? "done" : isCurrent ? "active" : "pending"} />
              <span
                className={
                  isCurrent
                    ? "font-medium text-foreground"
                    : isPast
                    ? "text-muted-foreground"
                    : "text-muted-foreground/80"
                }
              >
                {c.title}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CheckMarker({ state }: { state: "pending" | "active" | "done" }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-good/15 text-good">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path
            d="M1 5l2.5 2.5L9 2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
    );
  }
  return (
    <span className="h-5 w-5 rounded-full border border-dashed border-border" aria-hidden />
  );
}
