/** Daily quota enforcement per user (by plan) or anonymous IP. */
import { Usage, type User } from "./db";
import { ANON_LIMITS, planOf } from "../plans";
import { PlatformError } from "../platforms/types";

export function quotaFor(user: User | null) {
  return user ? planOf(user.plan) : { ...ANON_LIMITS };
}

export function consume(user: User | null, ip: string, kind: "lookups" | "downloads") {
  const subject = user ? user.id : `ip:${ip}`;
  const limits = quotaFor(user);
  const used = Usage.get(subject);
  const max = kind === "lookups" ? limits.dailyLookups : limits.dailyDownloads;
  if (used[kind] >= max) {
    throw new PlatformError(
      "rate_limited",
      user ? "Daily limit reached for your plan. Upgrade to Pro for more." : "Daily free limit reached. Create a free account or upgrade to Pro.",
      429,
    );
  }
  Usage.inc(subject, kind);
  return { used: used[kind] + 1, max };
}

export function usageSummary(user: User | null, ip: string) {
  const subject = user ? user.id : `ip:${ip}`;
  const limits = quotaFor(user);
  const u = Usage.get(subject);
  return {
    lookups: { used: u.lookups, max: limits.dailyLookups },
    downloads: { used: u.downloads, max: limits.dailyDownloads },
  };
}
