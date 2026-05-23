import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Globe, RotateCcw } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { IssueCard } from "@/components/IssueCard";
import { Button } from "@/components/ui/button";
import { loadCachedScan, tierFromScore, tierLabel, type ScanResponse } from "@/lib/scan";

export default function Result() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }
    const cached = loadCachedScan(id);
    if (cached) {
      setScan(cached);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const topIssues = useMemo(() => {
    if (!scan) return [];
    return [...scan.issues]
      .sort((a, b) => {
        const sevRank = { critical: 0, warning: 1, info: 2 } as const;
        const lossA = a.maxPoints - a.points;
        const lossB = b.maxPoints - b.points;
        if (lossB !== lossA) return lossB - lossA;
        return sevRank[a.severity] - sevRank[b.severity];
      })
      .slice(0, 5);
  }, [scan]);

  if (notFound) {
    return (
      <section className="container mx-auto max-w-xl py-20 text-center sm:py-28">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Resultatet er ikke tilgjengelig her
        </h1>
        <p className="mt-4 text-muted-foreground">
          Resultatet lagres i nettleseren din inntil du lukker fanen. Om du har
          åpnet linken i ny fane eller refreshet, må du kjøre sjekken på nytt.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Tilbake til forsiden
          </Link>
        </Button>
      </section>
    );
  }

  if (!scan) {
    return null;
  }

  const tier = tierFromScore(scan.score);
  const remainingIssues = scan.issues.filter((i) => !topIssues.includes(i));

  return (
    <section className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* HEADER */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          Synlighetscheck
          <span aria-hidden className="h-px w-6 bg-accent/40" />
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Score for{" "}
          <a
            href={`https://${scan.domain}`}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
          >
            {scan.domain}
          </a>
        </h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-foreground/55">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            Kjørt{" "}
            {new Date(scan.scannedAt).toLocaleString("nb-NO", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      {/* GAUGE */}
      <div className="relative mx-auto mt-10 max-w-3xl">
        <div
          aria-hidden
          className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-accent/10 via-transparent to-accent-soft/10 blur-2xl"
        />
        <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(13,148,136,0.2)] sm:p-10">
          <ScoreGauge score={scan.score} />
          <p
            data-quick-answer
            className="quick-answer max-w-xl text-center"
          >
            <strong>Kort fortalt:</strong>{" "}
            {tier === "ypperste"
              ? "Sterk teknisk grunnmur. Vi finner få eller ingen mangler — sannsynligvis godt posisjonert for AI-siteringer."
              : tier === "god"
              ? "Solid baseline. Et par konkrete tiltak vil løfte synligheten til ypperste klasse."
              : tier === "ok"
              ? "Tekniske bein er på plass, men sentrale entity- og innholdssignaler mangler. Topp-5 under viser hvor."
              : tier === "svak"
              ? "Mange grunnleggende AEO-signaler mangler. Det er fortsatt enkle løft som kan flytte score raskt."
              : "Stort potensial — flere kritiske signaler mangler. Start med topp-3 i lista under for raskest løft."}
          </p>
        </div>
      </div>

      {/* TOP ISSUES */}
      <div className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Topp {topIssues.length} mangler
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              Det viktigste å fikse først
            </h2>
          </div>
          <Globe className="hidden h-5 w-5 text-foreground/30 sm:block" aria-hidden />
        </div>
        <div className="grid gap-3">
          {topIssues.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} defaultOpen={i === 0} />
          ))}
          {topIssues.length === 0 && (
            <div className="rounded-2xl border border-dashed border-good/40 bg-good/5 p-8 text-center">
              <p className="font-display text-lg font-semibold text-good">
                Ingen kritiske mangler funnet
              </p>
              <p className="mt-2 text-sm text-foreground/65">
                Hver av de ti sjekkene scoret fullt eller nær fullt. Bra
                tekniske grunnmur.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ALL CHECKS COLLAPSED */}
      {remainingIssues.length > 0 && (
        <details className="group/details mt-10 overflow-hidden rounded-2xl border border-border bg-card transition-shadow open:shadow-sm">
          <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-5 py-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted/50">
            <span>
              Resterende {remainingIssues.length} sjekker
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/8 text-accent transition-transform group-open/details:rotate-180">
              <RotateCcw className="h-3.5 w-3.5 -scale-x-100 rotate-90" aria-hidden />
            </span>
          </summary>
          <div className="grid gap-3 border-t border-border/60 bg-background/40 px-5 py-5">
            {remainingIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </details>
      )}

      {/* META */}
      <div className="mt-14 flex flex-col items-center gap-4 border-t border-border pt-10 text-center">
        <p className="max-w-2xl text-sm leading-relaxed text-foreground/65">
          Resultatet er sendt til e-posten din. Hvis du la inn telefonnummer,
          kan vi ringe deg for å gå gjennom score-en og foreslå tiltak.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/">
              <RotateCcw className="h-4 w-4" aria-hidden /> Sjekk et nytt domene
            </Link>
          </Button>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-foreground/45">
          Nivå: <span className="text-foreground/65">{tierLabel(tier)}</span> ·{" "}
          {scan.score}/100
        </p>
      </div>
    </section>
  );
}
