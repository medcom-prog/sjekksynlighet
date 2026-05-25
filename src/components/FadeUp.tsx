import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Liten entrance-animasjon-wrapper. Fade fra opacity-0 + translate-y-2
 * til synlig over 600 ms cubic-out. To moduser:
 *
 *   - `immediate`: animerer rett etter mount (bruk for innhold over fold,
 *     typisk hero-elementer).
 *   - default (scroll-trigget): bruker IntersectionObserver som fyrer av
 *     når elementet er ~10 % synlig. Engangs — disconnect etter fyring.
 *
 * `delay` i ms stagger-er en gruppe (kort 4-5 søsken bør være rytmisk:
 * 0, 80, 160, 240, 320 ms typisk). Lengre delays føles tregt.
 *
 * Respekterer prefers-reduced-motion via global index.css-regel som
 * collapser transition-duration til 0.001ms — vi trenger ikke logikk her.
 */
type FadeUpProps = {
  children: ReactNode;
  /** ms forsinkelse fra trigger til animasjon starter */
  delay?: number;
  /** Animer rett etter mount istedenfor scroll-into-view */
  immediate?: boolean;
  /** Custom wrapper-tag (default div) */
  as?: ElementType;
  className?: string;
};

export function FadeUp({
  children,
  delay = 0,
  immediate = false,
  as: Tag = "div",
  className,
}: FadeUpProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      // Bruk rAF så transition fyres etter at initial render har commitet
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className,
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
