import Link from "next/link";
import type { Connection, Platform } from "@/lib/platforms/types";
import { Avatar, VerifiedIcon } from "../../ui";

export function ConnectionRow({ c, platform }: { c: Connection; platform: Platform }) {
  return (
    <Link href={`/${platform}/${c.username}`} className="card card-hover flex items-center gap-3 p-3">
      <Avatar src={c.avatarUrl || `/api/placeholder?seed=avatar-${c.username}&w=96&h=96`} alt={c.username} size={44} ring={false} />
      <div className="min-w-0">
        <div className="flex items-center gap-1 truncate font-semibold text-ink">
          {c.displayName} {c.verified && <VerifiedIcon className="h-4 w-4" />}
        </div>
        <div className="truncate text-xs text-ink-3" dir="ltr">
          @{c.username}
        </div>
      </div>
    </Link>
  );
}
