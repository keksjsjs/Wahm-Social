import { getDict } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Badge, ProBadge } from "@/components/ui";

export const metadata = buildMetadata({ title: "Wahm Social API — Developer docs", path: "/api-docs", description: "REST API for public TikTok & Instagram profile data, posts, analytics and media downloads." });

const ENDPOINTS: { method: string; path: string; desc: string; auth?: "pro" | "business" | "user"; example?: string }[] = [
  { method: "GET", path: "/api/profile/{platform}/{username}", desc: "Public profile (counts, bio, avatar, verified).", example: "/api/profile/tiktok/khaby.lame" },
  { method: "GET", path: "/api/posts/{platform}/{username}?limit=12", desc: "Recent public posts with stats and media URLs.", example: "/api/posts/tiktok/khaby.lame?limit=6" },
  { method: "GET", path: "/api/post/{platform}?ref={id|url}", desc: "Single public post detail." },
  { method: "GET", path: "/api/stories/{platform}/{username}", desc: "Public stories when available (Instagram, needs server session)." },
  { method: "GET", path: "/api/connections/{platform}/{username}?kind=followers", desc: "Followers / following — returns available:false when not public." },
  { method: "GET", path: "/api/analytics/{platform}/{username}", desc: "Engagement analytics. Advanced fields for Pro.", example: "/api/analytics/tiktok/khaby.lame" },
  { method: "GET", path: "/api/resolve?url={postUrl}", desc: "Resolve any TikTok/Instagram post link to media." },
  { method: "GET", path: "/api/download?platform=&ref=&i=0[&kind=audio]", desc: "Stream media as attachment (counts quota)." },
  { method: "POST", path: "/api/batch", desc: "Batch manifest: { platform, username } or { urls: [] }.", auth: "pro" },
  { method: "POST", path: "/api/compare", desc: "Compare accounts: { accounts: [{platform, username}] }.", auth: "pro" },
  { method: "GET/POST/DELETE", path: "/api/watchlist", desc: "Manage watchlist.", auth: "pro" },
  { method: "GET", path: "/api/export/{platform}/{username}", desc: "CSV export of recent posts.", auth: "pro" },
  { method: "GET", path: "/api/health", desc: "Service health." },
];

export default function ApiDocs() {
  const { t } = getDict();
  return (
    <div className="container-w max-w-5xl pb-10">
      <PageHeader title="Wahm Social API" subtitle={t.features.analytics[1]} eyebrow={<Badge tone="gold">REST · JSON</Badge>} />
      <div className="card mb-6 p-6 text-sm leading-7 text-slate-300" dir="ltr">
        <p>
          All responses use the envelope <code className="text-gold-300">{`{ ok, source: "live"|"cache"|"demo", fetchedAt, data }`}</code> or{" "}
          <code className="text-gold-300">{`{ ok: false, error: { code, message } }`}</code>.
        </p>
        <p className="mt-2">
          Authenticate server-to-server with the <code className="text-gold-300">x-api-key</code> header (Business plan). Browser sessions use the secure session cookie.
        </p>
        <p className="mt-2">Error codes: not_found, private_account, blocked, rate_limited, invalid_input, pro_required, unauthorized, upstream_error.</p>
      </div>
      <div className="space-y-3" dir="ltr">
        {ENDPOINTS.map((e) => (
          <div key={e.path + e.method} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
            <span className="w-32 shrink-0 font-mono text-xs font-bold text-emerald-300">{e.method}</span>
            <code className="flex-1 break-all text-sm text-white">{e.path}</code>
            <span className="text-sm text-slate-400 sm:w-80">{e.desc}</span>
            {e.auth && <ProBadge label={e.auth.toUpperCase()} />}
            {e.example && (
              <a href={e.example} target="_blank" className="text-xs text-gold-300 hover:underline">
                try ↗
              </a>
            )}
          </div>
        ))}
      </div>
      <pre className="card mt-6 overflow-x-auto p-5 text-xs text-slate-300" dir="ltr">{`curl -H "x-api-key: wahm_xxx" https://YOUR-DOMAIN/api/profile/tiktok/khaby.lame`}</pre>
    </div>
  );
}

export const dynamic = "force-dynamic";
