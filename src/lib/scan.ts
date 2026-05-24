import type { CheckId } from "./checks";

/**
 * Felles type-kontrakt for api/scan.ts.
 * Endrer du shape her, må api/scan.ts oppdateres og motsatt.
 */

export type ScanTier = "kritisk" | "svak" | "ok" | "god" | "ypperste";

export type IssueSeverity = "critical" | "warning" | "info";

export type ScanIssue = {
  id: CheckId;
  title: string;
  /** Faktiske poeng denne sjekken fikk (0–10). */
  points: number;
  /** Maks-poeng for denne sjekken (alltid 10 i v1). */
  maxPoints: number;
  severity: IssueSeverity;
  /** Én konkret setning som forklarer funnet for dette domenet. */
  summary: string;
  /** Valgfri ekstra-kontekst (f.eks. liste over blokkerte bots). */
  detail?: string;
};

export type ScanInput = {
  domain: string;
  email: string;
  phone?: string;
  name?: string;
  firma?: string;
};

export type ScanResponse = {
  ok: true;
  scanId: string;
  score: number;
  tier: ScanTier;
  domain: string;
  scannedAt: string;
  issues: ScanIssue[];
};

export type ScanError = {
  ok: false;
  error:
    | "invalid_domain"
    | "rate_limited"
    | "fetch_failed"
    | "internal"
    | "missing_field";
  message: string;
};

export function tierFromScore(score: number): ScanTier {
  if (score >= 85) return "ypperste";
  if (score >= 71) return "god";
  if (score >= 51) return "ok";
  if (score >= 31) return "svak";
  return "kritisk";
}

export function tierLabel(tier: ScanTier): string {
  switch (tier) {
    case "ypperste":
      return "Ypperste klasse";
    case "god":
      return "God";
    case "ok":
      return "OK";
    case "svak":
      return "Svak";
    case "kritisk":
      return "Kritisk";
  }
}

/**
 * Én setning som forklarer hva nivået betyr i klartekst.
 * Brukes på resultat-siden for å gi mening til score-tallet.
 *
 * Stramt språk — vi vil ikke gjøre brukere komfortable med "OK"-score
 * når de teknisk sett er bak. 71+ er "ok", 85+ er "I toppen".
 */
export function tierHeadline(tier: ScanTier): string {
  switch (tier) {
    case "ypperste":
      return "I toppen — du er klar for AI-søk";
    case "god":
      return "Bra base, men gap — du er nær toppen";
    case "ok":
      return "Halvveis — du går glipp av siteringer hver dag";
    case "svak":
      return "Bak konkurrentene — alvorlige hull";
    case "kritisk":
      return "Akutt — AI-motorer kan praktisk talt ikke lese deg";
  }
}

/**
 * Lengre, mer praktisk forklaring av hva tieren betyr for bedriften.
 * Brukes som "Kort fortalt"-blokk på resultat-siden.
 *
 * Hver av disse er rammet rundt KONSEKVENS for forretningen, ikke
 * teknisk grunnmur. Vi sier hva brukeren MISTER ved status quo,
 * ikke bare hva de mangler.
 */
export function tierExplanation(tier: ScanTier): string {
  switch (tier) {
    case "ypperste":
      return "Du har gjort det meste riktig. ChatGPT, Google og andre AI-motorer kan lese, forstå og sitere nettsiden din. Vedlikehold det du har og tenk på neste nivå: faktisk innhold og autoritet.";
    case "god":
      return "Solid teknisk base, men du er ikke i mål. Konkurrenter med 85+ blir sitert oftere når kunder spør AI-er om bedrifter som din. Topp-mangler under viser de siste få punktene du må tette.";
    case "ok":
      return "De grunnleggende bitene er på plass, men du går glipp av betydelige siteringer hver dag. Når kunder spør ChatGPT, Gemini eller Perplexity om bedrifter som din, plukker AI-en heller konkurrenter som har fylt ut «visittkortet» sitt mer komplett.";
    case "svak":
      return "Du er bak de fleste konkurrenter teknisk sett. AI-motorer kan finne deg, men forstår lite — så de siterer noen andre. Det er fortsatt raske grep som kan flytte score-en betydelig. Start med topp-3.";
    case "kritisk":
      return "AI-motorer kan praktisk talt ikke lese nettsiden din. Det er hovedgrunnen til at du aldri dukker opp i ChatGPT- eller Gemini-svar. De gode nyhetene: det er ofte raske, konkrete fikser som løfter deg betydelig.";
  }
}

/**
 * Visuell tone for tier — bare 85+ er grønn. Alt under det er
 * gult/oransje/rødt. Ærlig kalibrering: på en 100-poengs-rubric
 * betyr 70 at du mangler 30 poeng av relevante AEO-signaler —
 * det fortjener "trenger oppmerksomhet", ikke grønt lys.
 *
 * Presedens: Google PageSpeed Insights gir samme regel (50–89 oransje).
 */
export function tierTone(tier: ScanTier): "good" | "ok" | "warn" {
  if (tier === "ypperste") return "good";        // 85+
  if (tier === "god") return "ok";               // 71–84
  return "warn";                                 // alt under 71
}

const SCAN_CACHE_PREFIX = "sjekk:scan:";

export function cacheScan(result: ScanResponse) {
  try {
    sessionStorage.setItem(SCAN_CACHE_PREFIX + result.scanId, JSON.stringify(result));
  } catch {
    /* storage full or private mode — gracefully degrade */
  }
}

export function loadCachedScan(scanId: string): ScanResponse | null {
  try {
    const raw = sessionStorage.getItem(SCAN_CACHE_PREFIX + scanId);
    if (!raw) return null;
    return JSON.parse(raw) as ScanResponse;
  } catch {
    return null;
  }
}
