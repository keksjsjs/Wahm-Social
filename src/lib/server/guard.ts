/** Shared request-guard helpers for API routes. */
import { isPlatform, PlatformError, type Platform } from "../platforms/types";
import { isValidUsername, normalizeUsername } from "../format";
import { clientIp, enforceRateLimit } from "./rateLimit";
import { limit, platformEnabled, requireNotMaintenance } from "../site/flags";

export function parsePlatform(v: string): Platform {
  if (!isPlatform(v) || !platformEnabled(v)) throw new PlatformError("invalid_input", "Unknown platform", 400);
  return v;
}

export function parseUsername(v: string): string {
  const u = normalizeUsername(v);
  if (!isValidUsername(u)) throw new PlatformError("invalid_input", "Invalid username", 400);
  return u;
}

/** Per-scope default req/min (admin-configurable). Auth scopes pass an explicit limit. */
function scopeLimit(scope: string): number {
  if (scope === "dl") return limit("downloadPerMin", 1, 10_000);
  if (scope === "stream") return limit("streamPerMin", 1, 10_000);
  return limit("apiPerMin", 1, 10_000);
}

/** Burst protection per IP; also returns 503 while maintenance mode is on (except auth). */
export function burstGuard(req: Request, scope = "api", max?: number) {
  if (scope !== "auth") requireNotMaintenance();
  const ip = clientIp(req);
  enforceRateLimit(`${scope}:${ip}`, max ?? scopeLimit(scope), 60_000);
  return ip;
}
