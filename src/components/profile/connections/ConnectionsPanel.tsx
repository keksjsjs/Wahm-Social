import Link from "next/link";
import type { ConnectionsResult, Platform } from "@/lib/platforms/types";
import type { Dict, Locale } from "@/lib/i18n";
import { compact } from "@/lib/format";
import { EmptyState } from "../../ui";
import { ConnectionRow } from "./ConnectionRow";
import { VisibilityBadge } from "./VisibilityBadge";
import { REASON_COPY } from "./copy";
import { RelatedAccounts } from "./RelatedAccounts";

/**
 * Per-account behaviour: public lists render (when a provider returns data),
 * private or hidden lists show a locked state explaining why.
 */
export function ConnectionsPanel({
  result,
  kind,
  platform,
  username,
  t,
  locale,
}: {
  result: ConnectionsResult;
  kind: "followers" | "following";
  platform: Platform;
  username: string;
  t: Dict;
  locale: Locale;
}) {
  const label = kind === "followers" ? t.profile.followers : t.profile.following;
  const header = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-ink">
        {label} {result.total !== undefined && <span className="text-sm text-ink-3">({compact(result.total, locale)})</span>}
      </h2>
      <VisibilityBadge v={result.visibility} locale={locale} />
    </div>
  );

  if (result.available) {
    return (
      <section>
        {header}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((c) => (
            <ConnectionRow key={c.username} c={c} platform={platform} locale={locale} />
          ))}
        </div>
        {result.nextCursor && (
          <div className="mt-6 text-center">
            <Link href={`/${platform}/${username}/${kind}?cursor=${result.nextCursor}`} className="btn-ghost">
              {locale === "ar" ? "تحميل المزيد" : "Load more"}
            </Link>
          </div>
        )}
      </section>
    );
  }

  const [title, desc] = REASON_COPY[result.reason ?? "not_supported"][locale];
  const isPublic = result.visibility === "public";
  return (
    <section>
      {header}
      {result.related && result.related.items.length > 0 && (
        <div className="mb-6">
          <RelatedAccounts related={result.related} platform={platform} locale={locale} />
        </div>
      )}
      <EmptyState
        icon={isPublic ? "🔓" : "🔒"}
        title={title}
        desc={desc}
        action={
          result.platformUrl && result.reason !== "account_private" ? (
            <a href={result.platformUrl} target="_blank" rel="nofollow noopener noreferrer" className="btn-primary">
              {t.profile.openOn} {platform === "tiktok" ? "TikTok" : "Instagram"} ↗
            </a>
          ) : undefined
        }
      />
    </section>
  );
}
