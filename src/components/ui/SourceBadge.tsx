import type { DataSource } from "@/lib/platforms/types";
import type { Dict } from "@/lib/i18n";
import { Badge } from "./index";

export function SourceBadge({ source, t }: { source: DataSource; t: Dict }) {
  if (source === "demo") return <Badge tone="red">● {t.states.demo}</Badge>;
  if (source === "cache") return <Badge tone="blue">● {t.states.cache}</Badge>;
  return <Badge tone="green">● {t.states.live}</Badge>;
}

export function NoticeBar({ notice }: { notice?: string }) {
  if (!notice) return null;
  return <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{notice}</div>;
}
