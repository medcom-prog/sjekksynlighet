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
 */
export function tierHeadline(tier: ScanTier): string {
  switch (tier) {
    case "ypperste":
      return "Toppskåren — AI-er finner deg lett";
    case "god":
      return "Bra grunnmur — to-tre fikser igjen";
    case "ok":
      return "Halvveis dit — det er hull å tette";
    case "svak":
      return "Svak — du er nok ofte usynlig for AI-er";
    case "kritisk":
      return "Akutt — start her";
  }
}

/**
 * Lengre, mer praktisk forklaring av hva tieren betyr for bedriften.
 * Brukes som "Kort fortalt"-blokk på resultat-siden.
 */
export function tierExplanation(tier: ScanTier): string {
  switch (tier) {
    case "ypperste":
      return "Du har gjort det meste riktig. ChatGPT, Google og andre AI-motorer kan lese, forstå og sitere nettsiden din. Vedlikehold det du har og tenk på neste nivå: faktisk innhold og autoritet.";
    case "god":
      return "Det tekniske grunnlaget er solid. Du har et par konkrete forbedringer som vil løfte deg til toppen — se topp-mangler under, fiks dem, og du er der.";
    case "ok":
      return "De grunnleggende bitene er på plass, men sentrale signaler mangler. Når kunder spør AI-er om bedrifter som din, blir du nok forbigått fordi konkurrenter har fylt ut «visittkortet» sitt mer komplett.";
    case "svak":
      return "Flere fundamentale ting mangler. AI-motorer kan finne deg, men forstår lite. Det er fortsatt enkle løft som kan flytte score-en raskt — fokuser på topp-3 først.";
    case "kritisk":
      return "AI-motorer kan praktisk talt ikke lese nettsiden din. Det er hovedgrunnen til at du aldri dukker opp i ChatGPT- eller Gemini-svar. De gode nyhetene: det er ofte raske, konkrete fikser som løfter deg betydelig.";
  }
}

export function tierTone(tier: ScanTier): "good" | "ok" | "warn" {
  if (tier === "ypperste" || tier === "god") return "good";
  if (tier === "ok") return "ok";
  return "warn";
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
