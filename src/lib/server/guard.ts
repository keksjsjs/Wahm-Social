/** Shared request-guard helpers for API routes. */
import { isPlatform, PlatformError, type Platform } from "../platforms/types";
import { isValidUsername, normalizeUsername } from "../format";
import { clientIp, enforceRateLimit } from "./rateLimit";

export function parsePlatform(v: string): Platform {
  if (!isPlatform(v)) throw new PlatformError("invalid_input", "Unknown platform", 400);
  return v;
}

export function parseUsername(v: string): string {
  const u = normalizeUsername(v);
  if (!isValidUsername(u)) throw new PlatformError("invalid_input", "Invalid username", 400);
  return u;
}

/** Burst protection: 40 req/min per IP across the API. */
export function burstGuard(req: Request, scope = "api", limit = 40) {
  const ip = clientIp(req);
  enforceRateLimit(`${scope}:${ip}`, limit, 60_000);
  return ip;
}
