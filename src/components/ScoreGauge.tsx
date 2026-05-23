import { useEffect, useRef, useState } from "react";
import { tierFromScore, tierLabel, tierTone, type ScanTier } from "@/lib/scan";

type Props = {
  score: number;
  size?: number;
  /** Antall sek for tellingen og strøk-animasjonen. */
  animateMs?: number;
};

const TONE_TO_VAR: Record<"good" | "ok" | "warn", string> = {
  good: "hsl(var(--good))",
  ok: "hsl(var(--accent))",
  warn: "hsl(var(--warn))",
};

/**
 * Halvring-gauge. Bakgrunnen er en svak grå halvring; foran tegner vi
 * en arc fra venstre til høyre som dekker `score%` av bueområdet. Score-
 * tallet teller opp under animasjonen for en mer responsiv følelse enn
 * et statisk tall.
 */
export function ScoreGauge({ score, size = 260, animateMs = 1100 }: Props) {
  const tier = tierFromScore(score);
  const tone = tierTone(tier);
  const color = TONE_TO_VAR[tone];

  const radius = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * radius; // halvbue
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  const [displayScore, setDisplayScore] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / animateMs);
      const eased = 1 - Math.pow(1 - t, 3); // cubic-out
      setDisplayScore(Math.round(score * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [score, animateMs]);

  const height = size / 2 + 20;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: size, height }}
        role="img"
        aria-label={`AEO-synlighetsscore: ${score} av 100, nivå ${tierLabel(tier)}`}
      >
        <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
          <path
            d={describeArc(cx, cy, radius, 180, 360)}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d={describeArc(cx, cy, radius, 180, 360)}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transition: `stroke-dashoffset ${animateMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-1 sm:pb-2"
          aria-hidden
        >
          <span
            className="font-mono text-[3.25rem] font-bold leading-none tracking-tight"
            style={{ color }}
          >
            {displayScore}
          </span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            av 100
          </span>
        </div>
      </div>
      <TierBadge tier={tier} tone={tone} />
    </div>
  );
}

function TierBadge({
  tier,
  tone,
}: {
  tier: ScanTier;
  tone: "good" | "ok" | "warn";
}) {
  const cls =
    tone === "good"
      ? "bg-good/10 text-good"
      : tone === "ok"
      ? "bg-accent/10 text-accent"
      : "bg-warn/10 text-warn";
  return (
    <span
      className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {tierLabel(tier)}
    </span>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArc,
    0,
    end.x,
    end.y,
  ].join(" ");
}
