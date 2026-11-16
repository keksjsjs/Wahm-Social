/** Curated public accounts for the Explore page and sitemap seeding. */
import type { Platform } from "../platforms/types";

export interface Featured {
  platform: Platform;
  username: string;
  name: string;
  category: { ar: string; en: string };
}

export const FEATURED: Featured[] = [
  { platform: "tiktok", username: "khaby.lame", name: "Khaby Lame", category: { ar: "كوميديا", en: "Comedy" } },
  { platform: "tiktok", username: "charlidamelio", name: "Charli D'Amelio", category: { ar: "رقص", en: "Dance" } },
  { platform: "tiktok", username: "mrbeast", name: "MrBeast", category: { ar: "ترفيه", en: "Entertainment" } },
  { platform: "tiktok", username: "bellapoarch", name: "Bella Poarch", category: { ar: "موسيقى", en: "Music" } },
  { platform: "tiktok", username: "zachking", name: "Zach King", category: { ar: "خدع بصرية", en: "Magic" } },
  { platform: "tiktok", username: "tiktok", name: "TikTok", category: { ar: "رسمي", en: "Official" } },
  { platform: "tiktok", username: "nba", name: "NBA", category: { ar: "رياضة", en: "Sports" } },
  { platform: "tiktok", username: "realmadrid", name: "Real Madrid", category: { ar: "رياضة", en: "Sports" } },
  { platform: "instagram", username: "instagram", name: "Instagram", category: { ar: "رسمي", en: "Official" } },
  { platform: "instagram", username: "cristiano", name: "Cristiano Ronaldo", category: { ar: "رياضة", en: "Sports" } },
  { platform: "instagram", username: "leomessi", name: "Leo Messi", category: { ar: "رياضة", en: "Sports" } },
  { platform: "instagram", username: "natgeo", name: "National Geographic", category: { ar: "طبيعة", en: "Nature" } },
  { platform: "instagram", username: "nasa", name: "NASA", category: { ar: "علوم", en: "Science" } },
  { platform: "instagram", username: "nike", name: "Nike", category: { ar: "علامات تجارية", en: "Brands" } },
  { platform: "instagram", username: "selenagomez", name: "Selena Gomez", category: { ar: "مشاهير", en: "Celebrities" } },
  { platform: "instagram", username: "fcbarcelona", name: "FC Barcelona", category: { ar: "رياضة", en: "Sports" } },
];
