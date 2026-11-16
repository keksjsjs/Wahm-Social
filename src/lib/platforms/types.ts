/** Shared, platform-agnostic domain model used across the whole app. */

export type Platform = "tiktok" | "instagram";
export const PLATFORMS: Platform[] = ["tiktok", "instagram"];

export function isPlatform(v: string): v is Platform {
  return v === "tiktok" || v === "instagram";
}

export type DataSource = "live" | "cache" | "demo";

export interface Profile {
  platform: Platform;
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  isPrivate: boolean;
  isBusiness?: boolean;
  category?: string;
  externalUrl?: string;
  followers: number;
  following: number;
  likes?: number;
  postsCount: number;
  createdAt?: number;
  region?: string;
  language?: string;
  hasStory?: boolean;
  /** TikTok: 1 = following list visible to everyone. */
  followingVisibility?: number;
  /** Profile data came from the platform's public link-preview (limited fields). */
  preview?: boolean;
  profileUrl: string;
}

export type MediaType = "video" | "image" | "carousel";

export interface MediaItem {
  type: "video" | "image";
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface Post {
  platform: Platform;
  id: string;
  shortcode?: string;
  author: string;
  caption: string;
  type: MediaType;
  cover: string;
  media: MediaItem[];
  createdAt?: number;
  duration?: number;
  stats: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  };
  hashtags: string[];
  music?: { title: string; author: string; url?: string };
  url: string;
}

export interface Story {
  platform: Platform;
  id: string;
  author: string;
  type: "video" | "image";
  url: string;
  thumbnail: string;
  takenAt?: number;
  expiresAt?: number;
}

export interface Connection {
  username: string;
  displayName: string;
  avatarUrl: string;
  verified: boolean;
  /** Unix seconds of the public activity that surfaced this account (e.g. a comment). */
  activeAt?: number;
  /** Short public context, e.g. the comment text. */
  note?: string;
}

/** Publicly visible accounts related to a profile when the real list can't be read officially. */
export interface RelatedAccounts {
  kind: "recent_commenters";
  items: Connection[];
}

export type ConnectionsReason =
  | "account_private" // the account itself is private → never shown
  | "hidden_by_user" // the owner hid this list in their privacy settings
  | "provider_required" // list is public but needs an official API provider to be configured
  | "login_only" // platform only shows this list to signed-in users
  | "not_supported";

export interface ConnectionsResult {
  available: boolean;
  reason?: ConnectionsReason;
  /** "public" when the account owner allows this list to be seen. */
  visibility: "public" | "hidden" | "private" | "unknown";
  total?: number;
  items: Connection[];
  nextCursor?: string | null;
  provider?: string;
  /** Deep link to view the list on the platform itself. */
  platformUrl?: string;
  /** Fallback: recently active public accounts (clearly labelled, not claimed to be followers). */
  related?: RelatedAccounts;
}

export interface Envelope<T> {
  ok: true;
  source: DataSource;
  fetchedAt: number;
  data: T;
  notice?: string;
}

export interface ErrorEnvelope {
  ok: false;
  error: { code: ErrorCode; message: string };
}

export type ErrorCode =
  | "not_found"
  | "private_account"
  | "blocked"
  | "rate_limited"
  | "invalid_input"
  | "pro_required"
  | "unauthorized"
  | "upstream_error"
  | "internal";

export class PlatformError extends Error {
  constructor(public code: ErrorCode, message: string, public status = 400) {
    super(message);
    this.name = "PlatformError";
  }
}

export interface PlatformAdapter {
  platform: Platform;
  getProfile(username: string): Promise<Profile>;
  getPosts(username: string, opts?: { limit?: number }): Promise<Post[]>;
  getPost(idOrUrl: string, username?: string): Promise<Post>;
  getStories(username: string): Promise<Story[]>;
}
