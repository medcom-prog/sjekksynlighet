import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Code2,
  Info,
  TrendingUp,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECK_DEFINITIONS } from "@/lib/checks";
import type { ScanIssue } from "@/lib/scan";

type Props = {
  issue: ScanIssue;
  defaultOpen?: boolean;
};

/**
 * Severity-tokens — én vegg av styling per nivå så kortet leses
 * umiddelbart som "kritisk vs. forbedring vs. detalj". Den smale
 * left-stripa bærer mest av hierarki-signalet; resten matcher.
 */
const SEVERITY_STYLE = {
  critical: {
    pill: "bg-warn/10 text-warn",
    label: "Kritisk",
    stripe: "before:bg-warn",
    Icon: AlertTriangle,
    bar: "bg-warn",
    track: "bg-warn/15",
  },
  warning: {
    pill: "bg-amber-100 text-amber-800",
    label: "Forbedring",
    stripe: "before:bg-amber-400",
    Icon: AlertTriangle,
    bar: "bg-amber-400",
    track: "bg-amber-100",
  },
  info: {
    pill: "bg-good/10 text-good",
    label: "Bra",
    stripe: "before:bg-good",
    Icon: CheckCircle2,
    bar: "bg-good",
    track: "bg-good/15",
  },
} as const;

export function IssueCard({ issue, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [showTech, setShowTech] = useState(false);
  const def = CHECK_DEFINITIONS.find((c) => c.id === issue.id);
  const meta = SEVERITY_STYLE[issue.severity];
  const Icon = meta.Icon;
  const pct = Math.max(0, Math.min(100, (issue.points / issue.maxPoints) * 100));
  const pointsToGain = issue.maxPoints - issue.points;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all",
        "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1",
        meta.stripe,
        open ? "shadow-[0_8px_24px_-12px_rgba(15,20,25,0.18)]" : "hover:shadow-sm",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 p-5 pl-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <span
          className={cn(
            "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            meta.pill,
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
                meta.pill,
              )}
            >
              {meta.label}
            </span>
            <span className="font-mono text-[11px] text-foreground/60">
              {issue.points}/{issue.maxPoints} poeng
            </span>
          </div>
          <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-foreground">
            {def?.title ?? issue.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground/65 line-clamp-2">
            {def?.plain.what ?? issue.summary}
          </p>
          {/* Thin score bar — visualizes points/max at a glance */}
          <div
            className={cn(
              "mt-3 h-1 w-full overflow-hidden rounded-full",
              meta.track,
            )}
            aria-hidden
          >
            <div
              className={cn("h-full rounded-full transition-[width] duration-500", meta.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-foreground/40 transition-transform",
            open && "rotate-180 text-foreground/60",
          )}
          aria-hidden
        />
      </button>

      {open && def && (
        <div className="border-t border-border/60 bg-background/30 px-5 pl-6 pt-5 pb-5">
          {/* Effort-badges — sier hvor lang tid + hvem som må fikse + potensielt løft */}
          <div className="mb-4 flex flex-wrap gap-2">
            <EffortBadge icon={<Clock className="h-3.5 w-3.5" />} label={def.effort.timeToFix} />
            <EffortBadge icon={<Wrench className="h-3.5 w-3.5" />} label={def.effort.difficulty} />
            {pointsToGain > 0 && (
              <EffortBadge
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label={`+${pointsToGain} poeng å hente`}
                tone="accent"
              />
            )}
          </div>

          {/* Konkret funn for DETTE domenet — ikke generelt */}
          {issue.summary && (
            <div className="mb-4 rounded-xl border border-border/60 bg-card p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/55">
                <Info className="h-3.5 w-3.5 text-accent" aria-hidden />
                Vi fant
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">
                {issue.summary}
              </p>
            </div>
          )}

          {/* Plain forklaring — alltid synlig */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <DetailBlock
              heading="Hvorfor det betyr noe"
              body={def.plain.why}
              icon={<Info className="h-4 w-4 text-accent" aria-hidden />}
            />
            <DetailBlock
              heading="Slik fikser man det"
              body={def.plain.howToFix}
              icon={<Wrench className="h-4 w-4 text-accent" aria-hidden />}
            />
          </div>

          {/* Teknisk versjon — kun for utvikleren din */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowTech((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/55 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1 -ml-2"
            >
              <Code2 className="h-3.5 w-3.5" aria-hidden />
              {showTech ? "Skjul teknisk versjon" : "Vis teknisk versjon for utvikler"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showTech && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {showTech && (
              <div className="mt-3 grid gap-3 rounded-xl border border-dashed border-border bg-background/70 p-4 sm:grid-cols-2 sm:gap-4">
                <DetailBlock
                  heading="Teknisk: hva vi sjekker"
                  body={def.technical.what}
                  icon={<Code2 className="h-4 w-4 text-foreground/55" aria-hidden />}
                  tone="mono"
                />
                <DetailBlock
                  heading="Teknisk: hva som må gjøres"
                  body={def.technical.howToFix}
                  icon={<Wrench className="h-4 w-4 text-foreground/55" aria-hidden />}
                  tone="mono"
                />
                {issue.detail && (
                  <div className="sm:col-span-2 rounded-lg border border-dashed border-border bg-background/60 p-3 text-xs leading-relaxed text-foreground/70">
                    <span className="mb-1 block font-semibold uppercase tracking-wider text-foreground/55">
                      Råverdier fra sjekken
                    </span>
                    <span className="font-mono break-words">{issue.detail}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function EffortBadge({
  icon,
  label,
  tone = "muted",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "muted" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "accent"
          ? "bg-accent/10 text-accent ring-1 ring-inset ring-accent/20"
          : "bg-foreground/[0.04] text-foreground/65 ring-1 ring-inset ring-border/60",
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function DetailBlock({
  heading,
  body,
  icon,
  tone,
}: {
  heading: string;
  body: string;
  icon: React.ReactNode;
  tone?: "mono";
}) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-inset ring-border/50">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/65">
        {icon}
        {heading}
      </div>
      <p
        className={cn(
          "text-sm leading-relaxed text-foreground/80",
          tone === "mono" && "font-mono text-[13px]",
        )}
      >
        {body}
      </p>
    </div>
  );
}

