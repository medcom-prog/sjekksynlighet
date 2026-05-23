import { useState } from "react";
import { AlertTriangle, ChevronDown, Info, Wrench, CheckCircle2 } from "lucide-react";
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
  const def = CHECK_DEFINITIONS.find((c) => c.id === issue.id);
  const meta = SEVERITY_STYLE[issue.severity];
  const Icon = meta.Icon;
  const pct = Math.max(0, Math.min(100, (issue.points / issue.maxPoints) * 100));

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all",
        // Left severity stripe via ::before — beholder rounded corners
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
            {issue.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground/65 line-clamp-2">
            {issue.summary}
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

      {open && (
        <div className="grid gap-3 border-t border-border/60 px-5 py-5 pl-6 sm:grid-cols-2 sm:gap-4">
          <DetailBlock
            heading="Hvorfor det betyr noe"
            body={def?.why ?? issue.summary}
            icon={<Info className="h-4 w-4 text-accent" aria-hidden />}
          />
          <DetailBlock
            heading="Slik fikser man det"
            body={def?.howToFix ?? "Se vår tekniske dokumentasjon for den anbefalte løsningen."}
            icon={<Wrench className="h-4 w-4 text-accent" aria-hidden />}
          />
          {issue.detail && (
            <div className="sm:col-span-2 rounded-xl border border-dashed border-border bg-background/60 p-4 text-xs leading-relaxed text-foreground/70">
              <span className="mb-1 block font-semibold uppercase tracking-wider text-foreground/55">
                Detaljer fra sjekken
              </span>
              <span className="font-mono break-words">{issue.detail}</span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DetailBlock({
  heading,
  body,
  icon,
}: {
  heading: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-background/60 p-4 ring-1 ring-inset ring-border/50">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/65">
        {icon}
        {heading}
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{body}</p>
    </div>
  );
}
