import { useState } from "react";
import { AlertTriangle, ChevronDown, Info, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECK_DEFINITIONS } from "@/lib/checks";
import type { ScanIssue } from "@/lib/scan";

type Props = {
  issue: ScanIssue;
  defaultOpen?: boolean;
};

const SEVERITY_STYLE = {
  critical: {
    pill: "bg-warn/10 text-warn",
    label: "Kritisk",
    Icon: AlertTriangle,
  },
  warning: {
    pill: "bg-amber-100 text-amber-700",
    label: "Forbedring",
    Icon: AlertTriangle,
  },
  info: {
    pill: "bg-accent/10 text-accent",
    label: "Detalj",
    Icon: Info,
  },
} as const;

export function IssueCard({ issue, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const def = CHECK_DEFINITIONS.find((c) => c.id === issue.id);
  const meta = SEVERITY_STYLE[issue.severity];
  const Icon = meta.Icon;

  return (
    <article
      className={cn(
        "group rounded-2xl border border-border bg-card transition-shadow",
        open ? "shadow-md" : "hover:shadow-sm",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            meta.pill,
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider", meta.pill)}
            >
              {meta.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {issue.points}/{issue.maxPoints} poeng
            </span>
          </div>
          <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-foreground">
            {issue.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {issue.summary}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="grid gap-4 border-t border-border/60 px-5 py-5 sm:grid-cols-2">
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
            <div className="sm:col-span-2 rounded-xl border border-dashed border-border bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
              <span className="mb-1 block font-semibold uppercase tracking-wider text-foreground/70">
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
    <div className="rounded-xl bg-background/60 p-4">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">
        {icon}
        {heading}
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{body}</p>
    </div>
  );
}
