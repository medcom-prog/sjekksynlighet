import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CHECK_DEFINITIONS } from "@/lib/checks";
import { cacheScan, type ScanResponse, type ScanError } from "@/lib/scan";
import { Progress } from "@/components/ui/progress";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ScanFormValues } from "@/components/ScanForm";

const STEP_INTERVAL_MS = 1100;

export default function Scanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ScanFormValues | null;
  const prefersReducedMotion = useReducedMotion();

  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!state || !state.domain || !state.email) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;

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

        const elapsed = Date.now() - startedAt.current;
        const minHold = 3000;
        const remaining = Math.max(0, minHold - elapsed);
        setTimeout(() => {
          if (cancelled) return;
          cacheScan(data);
          setDone(true);
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
      {/* Branded loading mark — vår egen loupe i en pulserende halo. */}
      <div className="relative">
        <div
          aria-hidden
          className={`absolute inset-0 -m-8 rounded-full bg-accent/15 blur-2xl ${
            prefersReducedMotion ? "" : "animate-pulse-soft"
          }`}
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 ring-1 ring-inset ring-accent/25">
          <BrandedLoupe
            spinning={!done && !prefersReducedMotion}
            className="h-10 w-10 text-accent"
          />
        </div>
        {/* Pulse-ring under hovedikonet — kun synlig mens vi venter */}
        {!done && !prefersReducedMotion && (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-accent/20"
          />
        )}
      </div>

      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        {done ? "Klar" : "Analyserer"}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {done ? "Resultatet er klart" : "Vi sjekker nettsiden din"}
      </h1>
      <p className="mt-3 max-w-md text-pretty text-foreground/65">
        {done
          ? "Sender deg videre til resultatet …"
          : "Dette tar normalt 8–20 sekunder. Vi kjører ti parallelle sjekker mot domenet ditt."}
      </p>

      <div className="mt-10 flex w-full items-center gap-3">
        <Progress value={progressValue} aria-label="Fremdrift" className="flex-1" />
        <span className="font-mono text-xs font-semibold text-foreground/55 tabular-nums">
          {progressValue}%
        </span>
      </div>

      <ul
        className="mt-8 w-full overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur"
        aria-live="polite"
      >
        {CHECK_DEFINITIONS.map((c, i) => {
          const isCurrent = !done && i === visibleIdx;
          const isPast = i < visibleIdx || done;
          return (
            <li
              key={c.id}
              className={`flex items-center gap-3 border-b border-border/50 px-5 py-3 text-sm transition-colors last:border-b-0 ${
                isCurrent ? "bg-accent/[0.04]" : ""
              }`}
            >
              <CheckMarker
                state={done ? "done" : isPast ? "done" : isCurrent ? "active" : "pending"}
              />
              <span
                className={
                  isCurrent
                    ? "font-medium text-foreground"
                    : isPast
                    ? "text-foreground/65"
                    : "text-foreground/40"
                }
              >
                {c.title}
              </span>
              {isCurrent && (
                <span className="ml-auto text-[11px] font-medium uppercase tracking-wider text-accent">
                  Kjører
                </span>
              )}
              {isPast && !isCurrent && (
                <span className="ml-auto text-[11px] font-medium uppercase tracking-wider text-good/70">
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs text-foreground/45">
        Vi sender deg ikke noen ekstra e-poster utover resultatet. Lover.
      </p>
    </section>
  );
}

function BrandedLoupe({
  spinning,
  className,
}: {
  spinning: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={`${className ?? ""} ${spinning ? "animate-spin" : ""}`}
      aria-hidden
      style={{ animationDuration: "2.6s" }}
    >
      <circle
        cx="13"
        cy="13"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="40 20"
      />
      <path
        d="M19 19l8 8"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
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
