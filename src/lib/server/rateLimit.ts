/**
 * Sliding-window rate limiter (in-memory). Keys are usually `${scope}:${ip|userId}`.
 */
import { PlatformError } from "../platforms/types";

interface Bucket {
  hits: number[];
}
const g = globalThis as unknown as { __wahmRL?: Map<string, Bucket> };
const buckets = (g.__wahmRL ??= new Map());

export interface RateResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  limit: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const b = buckets.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t: number) => now - t < windowMs);
  const allowed = b.hits.length < limit;
  if (allowed) b.hits.push(now);
  buckets.set(key, b);
  if (buckets.size > 50_000) {
    for (const [k, v] of buckets) if (!v.hits.length || now - v.hits[v.hits.length - 1] > windowMs) buckets.delete(k);
  }
  return {
    allowed,
    remaining: Math.max(0, limit - b.hits.length),
    resetMs: b.hits.length ? windowMs - (now - b.hits[0]) : 0,
    limit,
  };
}

export function enforceRateLimit(key: string, limit: number, windowMs: number): RateResult {
  const r = rateLimit(key, limit, windowMs);
  if (!r.allowed) throw new PlatformError("rate_limited", "Too many requests, slow down.", 429);
  return r;
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "0.0.0.0"
  );
}
