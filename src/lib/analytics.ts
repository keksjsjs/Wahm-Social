/**
 * Pure analytics over public metrics — no network. Used by the analytics
 * dashboard, compare page and CSV export.
 */
import type { Post, Profile } from "./platforms/types";

export interface Analytics {
  postsAnalyzed: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  engagementRate: number; // (likes+comments+shares)/followers per post
  viewEngagementRate: number; // (likes+comments+shares)/views
  postsPerWeek: number;
  medianGapHours: number;
  bestWeekday: number | null; // 0 = Sunday
  bestHour: number | null; // UTC hour
  topHashtags: { tag: string; count: number; avgLikes: number }[];
  topPosts: Post[];
  weekdayHistogram: number[];
  hourHistogram: number[];
  timeline: { t: number; likes: number; views: number; id: string }[];
  growthScore: number; // 0-100 heuristic
  tier: "nano" | "micro" | "mid" | "macro" | "mega";
  estimatedEarnings: { min: number; max: number; currency: "USD" };
  likesPerFollower: number;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const toMs = (t?: number) => (!t ? 0 : t < 1e12 ? t * 1000 : t);

export function tierOf(followers: number): Analytics["tier"] {
  if (followers >= 1_000_000) return "mega";
  if (followers >= 500_000) return "macro";
  if (followers >= 50_000) return "mid";
  if (followers >= 10_000) return "micro";
  return "nano";
}

/** CPM-style earnings estimate per sponsored post based on tier & engagement. */
export function estimateEarnings(followers: number, er: number, platform: Profile["platform"]) {
  const base = platform === "instagram" ? 10 : 6; // USD per 1k followers
  const erFactor = Math.min(3, Math.max(0.3, er / 0.03));
  const mid = (followers / 1000) * base * erFactor;
  return { min: Math.round(mid * 0.6), max: Math.round(mid * 1.5), currency: "USD" as const };
}

export function analyze(profile: Profile, posts: Post[]): Analytics {
  const views = posts.map((p) => p.stats.views ?? 0);
  const likes = posts.map((p) => p.stats.likes ?? 0);
  const comments = posts.map((p) => p.stats.comments ?? 0);
  const shares = posts.map((p) => p.stats.shares ?? 0);
  const interactions = posts.map((_, i) => likes[i] + comments[i] + shares[i]);

  const followers = Math.max(1, profile.followers);
  const engagementRate = avg(interactions) / followers;
  const totalViews = views.reduce((a, b) => a + b, 0);
  const viewEngagementRate = totalViews ? interactions.reduce((a, b) => a + b, 0) / totalViews : 0;

  const times = posts.map((p) => toMs(p.createdAt)).filter(Boolean).sort((a, b) => b - a);
  const gaps: number[] = [];
  for (let i = 1; i < times.length; i++) gaps.push((times[i - 1] - times[i]) / 36e5);
  const spanWeeks = times.length > 1 ? (times[0] - times[times.length - 1]) / (7 * 864e5) : 0;
  const postsPerWeek = spanWeeks > 0 ? (times.length - 1) / spanWeeks : times.length;

  const weekdayHistogram = Array(7).fill(0);
  const hourHistogram = Array(24).fill(0);
  const weekdayScore = Array(7).fill(0);
  const hourScore = Array(24).fill(0);
  posts.forEach((p, i) => {
    const t = toMs(p.createdAt);
    if (!t) return;
    const d = new Date(t);
    weekdayHistogram[d.getUTCDay()]++;
    hourHistogram[d.getUTCHours()]++;
    weekdayScore[d.getUTCDay()] += interactions[i];
    hourScore[d.getUTCHours()] += interactions[i];
  });
  const argmax = (xs: number[]) => (xs.some((x) => x > 0) ? xs.indexOf(Math.max(...xs)) : null);

  const tagStats = new Map<string, { count: number; likes: number }>();
  posts.forEach((p) =>
    p.hashtags.forEach((tag) => {
      const s = tagStats.get(tag) ?? { count: 0, likes: 0 };
      s.count++;
      s.likes += p.stats.likes ?? 0;
      tagStats.set(tag, s);
    }),
  );
  const topHashtags = [...tagStats.entries()]
    .map(([tag, s]) => ({ tag, count: s.count, avgLikes: Math.round(s.likes / s.count) }))
    .sort((a, b) => b.count - a.count || b.avgLikes - a.avgLikes)
    .slice(0, 15);

  const topPosts = [...posts].sort((a, b) => (b.stats.likes ?? 0) - (a.stats.likes ?? 0)).slice(0, 6);
  const timeline = posts
    .filter((p) => p.createdAt)
    .map((p) => ({ t: toMs(p.createdAt), likes: p.stats.likes ?? 0, views: p.stats.views ?? 0, id: p.id }))
    .sort((a, b) => a.t - b.t);

  const freqScore = Math.min(1, postsPerWeek / 5);
  const erScore = Math.min(1, engagementRate / 0.06);
  const reachScore = Math.min(1, Math.log10(followers) / 7);
  const growthScore = Math.round((freqScore * 0.3 + erScore * 0.45 + reachScore * 0.25) * 100);

  return {
    postsAnalyzed: posts.length,
    avgViews: Math.round(avg(views)),
    avgLikes: Math.round(avg(likes)),
    avgComments: Math.round(avg(comments)),
    avgShares: Math.round(avg(shares)),
    engagementRate,
    viewEngagementRate,
    postsPerWeek: Math.round(postsPerWeek * 10) / 10,
    medianGapHours: Math.round(median(gaps)),
    bestWeekday: argmax(weekdayScore),
    bestHour: argmax(hourScore),
    topHashtags,
    topPosts,
    weekdayHistogram,
    hourHistogram,
    timeline,
    growthScore,
    tier: tierOf(profile.followers),
    estimatedEarnings: estimateEarnings(profile.followers, engagementRate, profile.platform),
    likesPerFollower: (profile.likes ?? 0) / followers,
  };
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export function postsToCsv(posts: Post[]): string {
  return toCsv(
    posts.map((p) => ({
      id: p.id,
      url: p.url,
      created: p.createdAt ? new Date(toMs(p.createdAt)).toISOString() : "",
      type: p.type,
      views: p.stats.views ?? "",
      likes: p.stats.likes ?? "",
      comments: p.stats.comments ?? "",
      shares: p.stats.shares ?? "",
      hashtags: p.hashtags.join(" "),
      caption: p.caption.replace(/\s+/g, " ").slice(0, 300),
    })),
  );
}
