import type { Dict } from "@/lib/i18n";
import { ProBadge } from "../ui";

const ICONS: Record<string, string> = {
  profile: "◉",
  posts: "▦",
  download: "⬇",
  stories: "◔",
  analytics: "▲",
  compare: "⇄",
  watchlist: "★",
  batch: "⇊",
  privacy: "⛨",
};

export function FeatureGrid({ t }: { t: Dict }) {
  const keys = ["profile", "posts", "download", "stories", "analytics", "compare", "watchlist", "batch", "privacy"] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {keys.map((k) => {
        const [title, desc] = t.features[k];
        const pro = k === "compare" || k === "watchlist" || k === "batch";
        return (
          <div key={k} className="card card-hover p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-xl text-gold-300">{ICONS[k]}</span>
              {pro && <ProBadge />}
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-400">{desc.replace(/\s*\((Pro|برو)\)/, "")}</p>
          </div>
        );
      })}
    </div>
  );
}
