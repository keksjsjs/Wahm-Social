import Link from "next/link";
import type { ConnectionsResult, Platform } from "@/lib/platforms/types";
import type { Dict, Locale } from "@/lib/i18n";
import { compact } from "@/lib/format";
import { EmptyState } from "../../ui";
import { ConnectionRow } from "./ConnectionRow";
import { VisibilityBadge } from "./VisibilityBadge";
import { AttemptsList } from "./AttemptsList";
import { REASON_COPY } from "./copy";

const SLOTS = 5;

/**
 * Per-account behaviour: the latest followers render when any legitimate method
 * returns them; otherwise five empty slots, the methods tried, and why.
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
  const ar = locale === "ar";
  const label = kind === "followers" ? t.profile.followers : t.profile.following;
  const latestTitle = kind === "followers" ? (ar ? "آخر 5 متابعين" : "Latest 5 followers") : ar ? "آخر 5 يتابعهم" : "Latest 5 followed";
  const header = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-ink">
        {label} {result.total !== undefined && <span className="text-sm text-ink-3">({compact(result.total, locale)})</span>}
      </h2>
      <VisibilityBadge v={result.visibility} locale={locale} />
    </div>
  );
  const openBtn =
    result.platformUrl && result.reason !== "account_private" ? (
      <a href={result.platformUrl} target="_blank" rel="nofollow noopener noreferrer" className="btn-primary">
        {t.profile.openOn} {platform === "tiktok" ? "TikTok" : "Instagram"} ↗
      </a>
    ) : undefined;

  if (result.available) {
    return (
      <section>
        {header}
        <h3 className="mb-3 text-base font-bold text-ink">{latestTitle}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((c) => (
            <ConnectionRow key={c.username} c={c} platform={platform} locale={locale} />
          ))}
        </div>
        {result.nextCursor && (
          <div className="mt-6 text-center">
            <Link href={`/${platform}/${username}/${kind}?cursor=${result.nextCursor}`} className="btn-ghost">
              {ar ? "تحميل المزيد" : "Load more"}
            </Link>
          </div>
        )}
      </section>
    );
  }

  const [title, desc] = REASON_COPY[result.reason ?? "not_supported"][locale];
  const isPublic = result.visibility === "public";
  if (!isPublic || !result.attempts?.length) {
    return (
      <section>
        {header}
        <EmptyState icon={isPublic ? "🔓" : "🔒"} title={title} desc={desc} action={openBtn} />
      </section>
    );
  }

  return (
    <section>
      {header}
      <div className="card p-5 sm:p-6">
        <h3 className="text-base font-bold text-ink">{latestTitle}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: SLOTS }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-dashed border-line bg-glass p-3 opacity-70">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/5 text-ink-4">🔒</div>
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-3/4 rounded bg-ink/10" />
                <div className="h-2 w-1/2 rounded bg-ink/5" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-7 text-ink-2">
          <span className="font-semibold text-ink">{title}. </span>
          {desc}
        </p>
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-4">{ar ? "الطرق التي جرّبناها الآن" : "Methods we just tried"}</div>
          <AttemptsList attempts={result.attempts} locale={locale} />
        </div>
        {openBtn && <div className="mt-5">{openBtn}</div>}
      </div>
    </section>
  );
}
