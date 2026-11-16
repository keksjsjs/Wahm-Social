/**
 * Deterministic demo data used when a platform blocks the server (DEMO_MODE=auto)
 * or when DEMO_MODE=on. Every response built from this is labelled `source: "demo"`
 * so the UI can clearly show it is sample data.
 */
import type { Platform, Post, Profile, Story } from "./types";

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const TAGS = ["fyp", "explore", "viral", "trend", "saudi", "riyadh", "comedy", "travel", "food", "fashion", "tech", "gaming", "music", "art", "fitness"];
const CAPTIONS = [
  "يوم جديد ومحتوى جديد ✨",
  "Behind the scenes of today's shoot",
  "أكثر سؤال وصلني هالأسبوع 👇",
  "Weekend vibes only",
  "جربت هالفكرة وصدمتني النتيجة",
  "New drop — link in bio",
  "تحدي اليوم مع المتابعين 🔥",
  "Can't believe this happened",
];

export const placeholder = (seed: string, w = 600, h = 800) => `/api/placeholder?seed=${encodeURIComponent(seed)}&w=${w}&h=${h}`;

export function demoProfile(platform: Platform, username: string): Profile {
  const r = seeded(platform + username);
  const followers = Math.round(5_000 + r() * 3_000_000);
  return {
    platform,
    id: String(Math.floor(r() * 1e15)),
    username,
    displayName: username.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    bio: "حساب تجريبي — بيانات عيّنة لعرض الواجهة · Demo profile with sample data",
    avatarUrl: placeholder(`avatar-${username}`, 300, 300),
    verified: r() > 0.6,
    isPrivate: false,
    followers,
    following: Math.round(r() * 900),
    likes: platform === "tiktok" ? Math.round(followers * (5 + r() * 20)) : undefined,
    postsCount: Math.round(40 + r() * 900),
    createdAt: Math.floor(Date.now() / 1000 - r() * 5 * 365 * 86400),
    hasStory: platform === "instagram",
    profileUrl: platform === "tiktok" ? `https://www.tiktok.com/@${username}` : `https://www.instagram.com/${username}/`,
  };
}

export function demoPosts(platform: Platform, username: string, count = 12): Post[] {
  const r = seeded("posts" + platform + username);
  const base = demoProfile(platform, username).followers;
  const now = Math.floor(Date.now() / 1000);
  return Array.from({ length: count }, (_, i) => {
    const tags = TAGS.filter(() => r() > 0.75).slice(0, 4);
    const views = Math.round(base * (0.2 + r() * 2.5));
    const likes = Math.round(views * (0.03 + r() * 0.12));
    const id = `demo${i}${Math.floor(r() * 1e9)}`;
    const isVideo = platform === "tiktok" || r() > 0.5;
    return {
      platform,
      id,
      author: username,
      caption: `${CAPTIONS[i % CAPTIONS.length]} ${tags.map((t) => "#" + t).join(" ")}`,
      type: isVideo ? "video" : "image",
      cover: placeholder(`${username}-${i}`),
      media: [{ type: "image", url: placeholder(`${username}-${i}`, 1080, 1440) }],
      createdAt: now - Math.round((i + r()) * 86400 * (1 + r() * 2)),
      duration: isVideo ? Math.round(8 + r() * 50) : undefined,
      stats: {
        views: isVideo ? views : undefined,
        likes,
        comments: Math.round(likes * (0.01 + r() * 0.05)),
        shares: platform === "tiktok" ? Math.round(likes * r() * 0.08) : undefined,
      },
      hashtags: tags,
      url: platform === "tiktok" ? `https://www.tiktok.com/@${username}` : `https://www.instagram.com/${username}/`,
    } satisfies Post;
  });
}

export function demoStories(platform: Platform, username: string): Story[] {
  return Array.from({ length: 3 }, (_, i) => ({
    platform,
    id: `demo-story-${i}`,
    author: username,
    type: "image" as const,
    url: placeholder(`story-${username}-${i}`, 1080, 1920),
    thumbnail: placeholder(`story-${username}-${i}`, 270, 480),
    takenAt: Math.floor(Date.now() / 1000) - i * 3600,
  }));
}
