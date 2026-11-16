/** Blog registry — each article lives in its own module. */
import type { Article } from "./types";
import { article as a1 } from "./tiktok-downloader-iphone-android";
import { article as a2 } from "./snaptik-ssstik-alternative";
import { article as a3 } from "./instagram-reels-download-guide";
import { article as a4 } from "./how-to-see-tiktok-followers";
import { article as a5 } from "./instagram-story-viewer-guide";
import { article as a6 } from "./download-tiktok-without-watermark";
import { article as a7 } from "./instagram-engagement-rate";
import { article as a8 } from "./best-time-to-post-tiktok-saudi";
import { article as a9 } from "./view-instagram-stories-anonymously-truth";
import { article as a10 } from "./tiktok-influencer-pricing";
import { article as a11 } from "./grow-instagram-hashtags-2026";
import { article as a12 } from "./compare-creators-before-campaign";
import { article as a13 } from "./is-it-legal-to-download-social-videos";

export type { Article };
export const ARTICLES: Article[] = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13].sort((x, y) => y.date.localeCompare(x.date));
export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
