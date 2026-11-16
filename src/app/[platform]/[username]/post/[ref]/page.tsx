import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { getDict } from "@/lib/i18n/server";
import { parseRoute } from "@/lib/server/loaders";
import { getPost } from "@/lib/platforms";
import { PlatformError, type Platform } from "@/lib/platforms/types";
import { PostView } from "@/components/post/PostView";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, jsonLdVideo } from "@/lib/seo";
import { proxied } from "@/lib/mediaUrl";

type Params = { platform: string; username: string; ref: string };

const load = cache(async (platform: Platform, ref: string, username: string) => {
  try {
    return { ok: true as const, post: (await getPost(platform, ref, username)).data };
  } catch (e) {
    const pe = e instanceof PlatformError ? e : new PlatformError("internal", "Unexpected error", 500);
    return { ok: false as const, code: pe.code, message: pe.message };
  }
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = parseRoute(params.platform, params.username);
  if (!r) return {};
  const res = await load(r.platform, decodeURIComponent(params.ref), r.username);
  if (!res.ok) return buildMetadata({ title: `@${r.username} post | Frostly`, noindex: true });
  const p = res.post;
  return buildMetadata({
    title: `${p.caption.slice(0, 60) || "Post"} — @${p.author} | تحميل بدون علامة مائية`,
    description: `حمّل ${p.type === "video" ? "فيديو" : "صورة"} @${p.author} من ${r.platform === "tiktok" ? "تيك توك" : "انستقرام"} بدون علامة مائية. ${p.caption.slice(0, 140)}`,
    path: `/${r.platform}/${r.username}/post/${params.ref}`,
    image: p.cover ? proxied(p.cover) : undefined,
    type: p.type === "video" ? "video.other" : "article",
  });
}

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Params }) {
  const r = parseRoute(params.platform, params.username);
  if (!r) notFound();
  const { t, locale } = getDict();
  const res = await load(r.platform, decodeURIComponent(params.ref), r.username);
  return (
    <div className="container-w py-10">
      {res.ok ? (
        <>
          <JsonLd data={jsonLdVideo(res.post)} />
          <PostView post={res.post} t={t} locale={locale} />
        </>
      ) : (
        <ErrorPanel code={res.code} message={res.message} t={t} />
      )}
    </div>
  );
}
