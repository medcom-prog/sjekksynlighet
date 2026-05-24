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
