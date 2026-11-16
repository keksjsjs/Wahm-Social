import type { ConnectionsResult } from "@/lib/platforms/types";
import type { Locale } from "@/lib/i18n";
import { Badge } from "../../ui";

const LABELS: Record<ConnectionsResult["visibility"], { ar: string; en: string; tone: "green" | "red" | "default" }> = {
  public: { ar: "القائمة عامة", en: "List is public", tone: "green" },
  hidden: { ar: "أخفاها صاحب الحساب", en: "Hidden by owner", tone: "red" },
  private: { ar: "حساب خاص", en: "Private account", tone: "red" },
  unknown: { ar: "غير معروف", en: "Unknown", tone: "default" },
};

export function VisibilityBadge({ v, locale }: { v: ConnectionsResult["visibility"]; locale: Locale }) {
  const l = LABELS[v];
  return <Badge tone={l.tone}>{v === "public" ? "🔓" : "🔒"} {l[locale]}</Badge>;
}
