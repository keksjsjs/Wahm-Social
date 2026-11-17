/** Pure: summarise country / place / language from sampled TikTok posts. */
import type { Post, ProfileLocation } from "../types";

/**
 * Country = majority vote over the sampled videos' `locationCreated`
 * (ties go to the country of the most recent video). Never invents one.
 */
export function summarizeLocation(posts: Post[], language?: string): ProfileLocation | undefined {
  const sorted = [...posts].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const withCountry = sorted.filter((p) => p.location?.country);
  const counts = new Map<string, number>();
  withCountry.forEach((p) => counts.set(p.location!.country!, (counts.get(p.location!.country!) ?? 0) + 1));
  const place = sorted.find((p) => p.location?.place)?.location?.place;
  if (!withCountry.length && !place && !language) return undefined;
  const latestRank = (code: string) => withCountry.findIndex((p) => p.location!.country === code);
  const recent = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || latestRank(a[0]) - latestRank(b[0]))
    .map(([code, count]) => ({ code, count }));
  return {
    current: recent[0]?.code,
    place,
    recent,
    sample: withCountry.length,
    language,
  };
}

/** Majority vote over plain country codes (e.g. tikwm `region` per video). */
export function voteCountry(codes: (string | undefined)[]): { code?: string; count: number; total: number } {
  const valid = codes.filter((c): c is string => typeof c === "string" && /^[A-Z]{2}$/.test(c));
  const counts = new Map<string, number>();
  valid.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1));
  let best: string | undefined;
  for (const [c, n] of counts) if (!best || n > counts.get(best)! || (n === counts.get(best)! && valid.indexOf(c) < valid.indexOf(best))) best = c;
  return { code: best, count: best ? counts.get(best)! : 0, total: valid.length };
}
