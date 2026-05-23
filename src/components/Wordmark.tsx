import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  iconClassName?: string;
};

/**
 * Wordmark: lowercase "sjekksynlighet" prefixed by a hand-drawn-style
 * loupe (forstørrelsesglass). The glass uses a teal stroke with a
 * subtle inner highlight — distinct from generic Lucide Search icons
 * so the brand reads as its own thing, not a wireframe scaffold.
 */
export function Wordmark({ className, iconClassName }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("h-7 w-7 shrink-0", iconClassName)}
        aria-hidden="true"
      >
        <circle
          cx="11.5"
          cy="11.5"
          r="8"
          stroke="currentColor"
          strokeWidth="2.25"
          fill="none"
        />
        <path
          d="M17.5 17.5L24 24"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="9.5"
          cy="9.5"
          r="2"
          fill="currentColor"
          opacity="0.35"
        />
      </svg>
      <span className="font-display font-semibold tracking-tight text-[1.25rem] leading-none">
        sjekksynlighet
      </span>
    </span>
  );
}
