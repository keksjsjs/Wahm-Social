/** Pure: summarise country / place / language from sampled TikTok posts. */
import type { Post, ProfileLocation } from "../types";

export function summarizeLocation(posts: Post[], language?: string): ProfileLocation | undefined {
  const sorted = [...posts].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const withCountry = sorted.filter((p) => p.location?.country);
  const counts = new Map<string, number>();
  withCountry.forEach((p) => counts.set(p.location!.country!, (counts.get(p.location!.country!) ?? 0) + 1));
  const place = sorted.find((p) => p.location?.place)?.location?.place;
  if (!withCountry.length && !place && !language) return undefined;
  return {
    current: withCountry[0]?.location?.country,
    place,
    recent: [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ code, count })),
    sample: withCountry.length,
    language,
  };
}

