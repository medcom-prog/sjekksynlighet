import { useEffect, useState } from "react";

/**
 * `prefers-reduced-motion` som React-hook.
 *
 * Brukes der vi har JS-drevet animasjon (rAF, setTimeout) som ikke
 * fanges av den globale CSS-mediaqueryen i `index.css`. Eksempler:
 *   - ScoreGauge: rAF-basert count-up (vi hopper rett til endeverdi)
 *   - Scanner-progress: faux step-walking (vi hopper rett til 100 %)
 *
 * Lytter til endringer slik at brukere som flipper innstillingen
 * mid-session får oppdatert atferd uten reload.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}
