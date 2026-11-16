import type { ConnectionsResult } from "@/lib/platforms/types";
import type { Dict } from "@/lib/i18n";
import { Avatar, EmptyState, VerifiedIcon } from "../ui";

/** Honest locked state when lists aren't public; renders the list when they are. */
export function ConnectionsPanel({ result, t }: { result: ConnectionsResult; t: Dict }) {
  if (!result.available) return <EmptyState icon="🔒" title={t.connections.lockedTitle} desc={t.connections.lockedDesc} />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {result.items.map((c) => (
        <div key={c.username} className="card flex items-center gap-3 p-3">
          <Avatar src={c.avatarUrl} alt={c.username} size={44} ring={false} />
          <div className="min-w-0">
            <div className="flex items-center gap-1 truncate font-semibold text-white">
              {c.displayName} {c.verified && <VerifiedIcon className="h-4 w-4" />}
            </div>
            <div className="text-xs text-slate-400" dir="ltr">
              @{c.username}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
