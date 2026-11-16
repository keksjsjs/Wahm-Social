import Link from "next/link";
import type { Post } from "@/lib/platforms/types";
import type { Locale } from "@/lib/i18n";
import { compact, duration, timeAgo } from "@/lib/format";
import { postHref, proxied } from "@/lib/mediaUrl";

export function PostCard({ post, locale, linkable = true }: { post: Post; locale: Locale; linkable?: boolean }) {
  const ref = post.platform === "tiktok" ? post.id : post.shortcode ?? post.id;
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxied(post.cover) || `/api/placeholder?seed=${post.id}`}
        alt={post.caption.slice(0, 80) || `@${post.author}`}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      <div className="absolute start-2 top-2 flex gap-1">
        {post.type === "video" && <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">▶ {duration(post.duration)}</span>}
        {post.type === "carousel" && <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">❏ {post.media.length}</span>}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-2.5 text-[11px] text-white">
        <div className="flex items-center gap-3">
          {post.stats.views !== undefined && <span>▶ {compact(post.stats.views, "en")}</span>}
          {post.stats.likes !== undefined && <span>♥ {compact(post.stats.likes, "en")}</span>}
          {post.stats.comments !== undefined && <span>💬 {compact(post.stats.comments, "en")}</span>}
        </div>
        {post.createdAt && <div className="mt-0.5 text-[10px] text-ink-2">{timeAgo(post.createdAt, locale)}</div>}
      </div>
    </>
  );
  const cls = "group relative block aspect-[3/4] overflow-hidden rounded-xl border border-line bg-surface-2";
  return linkable && !post.id.startsWith("demo") ? (
    <Link href={postHref(post.platform, post.author, ref)} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function PostGrid({ posts, locale }: { posts: Post[]; locale: Locale }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} locale={locale} />
      ))}
    </div>
  );
}
