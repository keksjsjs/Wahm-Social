/**
 * Shared helpers for third-party public fallbacks (tikwm, countik).
 * Detect Cloudflare/HTML challenges honestly — never treat a wall as data.
 */
import { looksLikeBotWall } from "../../server/http";

export function thirdPartyBlocked(status: number, text: string, headers?: Headers): boolean {
  const head = text.slice(0, 4000);
  if (looksLikeBotWall(head)) return true;
  if (headers?.get("cf-mitigated") === "challenge") return true;
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<") && !trimmed.startsWith("{") && !trimmed.startsWith("[")) return true;
  if ((status === 403 || status === 429 || status === 503) && /cloudflare|just a moment|challenge-platform|cf-ray/i.test(head)) {
    return true;
  }
  return false;
}

export function parseJsonBody(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

export function asCountry(v: unknown): string | undefined {
  return typeof v === "string" && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : undefined;
}

export function asNum(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : undefined;
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
