import Link from "next/link";
import type { Connection, Platform } from "@/lib/platforms/types";
import type { Locale } from "@/lib/i18n";
import { Avatar, VerifiedIcon } from "../../ui";

function ago(sec: number, locale: Locale): string {
  const d = Math.max(0, Date.now() / 1000 - sec);
  const [n, u] = d < 3600 ? [Math.max(1, Math.round(d / 60)), "minute"] : d < 86400 ? [Math.round(d / 3600), "hour"] : [Math.round(d / 86400), "day"];
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-n, u as Intl.RelativeTimeFormatUnit);
}

export function ConnectionRow({ c, platform, locale = "en" }: { c: Connection; platform: Platform; locale?: Locale }) {
  return (
    <Link href={`/${platform}/${c.username}`} className="card card-hover flex items-center gap-3 p-3">
      <Avatar src={c.avatarUrl || `/api/placeholder?seed=avatar-${c.username}&w=96&h=96`} alt={c.username} size={44} ring={false} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 truncate font-semibold text-ink">
          <span className="truncate">{c.displayName}</span> {c.verified && <VerifiedIcon className="h-4 w-4 shrink-0" />}
        </div>
        <div className="truncate text-xs text-ink-3" dir="ltr">
          @{c.username}
          {c.activeAt ? <span className="text-ink-4"> · {ago(c.activeAt, locale)}</span> : null}
        </div>
        {c.note && <div className="mt-0.5 truncate text-xs text-ink-2">“{c.note}”</div>}
      </div>
    </Link>
  );
}
