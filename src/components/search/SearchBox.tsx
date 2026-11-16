"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "../I18nProvider";
import { cx, PlatformIcon } from "../ui";
import type { Platform } from "@/lib/platforms/types";
import { routeForQuery } from "@/lib/route";

export function SearchBox({ initialPlatform = "tiktok", size = "lg", initialQuery = "" }: { initialPlatform?: Platform; size?: "lg" | "md"; initialQuery?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [q, setQ] = useState(initialQuery);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const href = routeForQuery(q, platform);
    if (!href) return setErr(t.search.invalid);
    setErr("");
    setBusy(true);
    router.push(href);
  }

  return (
    <form onSubmit={submit} className={cx("mx-auto w-full", size === "lg" ? "max-w-2xl" : "max-w-xl")}>
      <div className="mb-3 flex justify-center gap-2">
        {(["tiktok", "instagram"] as Platform[]).map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setPlatform(p)}
            className={cx(
              "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              platform === p ? "border-gold-400/70 bg-gold-500/15 text-gold-200" : "border-white/10 text-slate-400 hover:text-white",
            )}
            aria-pressed={platform === p}
          >
            <PlatformIcon platform={p} />
            {p === "tiktok" ? t.search.tiktok : t.search.instagram}
          </button>
        ))}
      </div>
      <div className={cx("card flex items-center gap-2 p-2 shadow-gold", size === "lg" && "p-2.5")}>
        <span className="ps-3 text-lg text-gold-400">@</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search.placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-white placeholder:text-slate-500 focus:outline-none"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          dir="ltr"
          aria-label={t.search.placeholder}
        />
        <button className="btn-gold px-6 py-3" disabled={busy}>
          {busy ? "…" : t.search.button}
        </button>
      </div>
      <p className={cx("mt-2 text-center text-xs", err ? "text-rose-400" : "text-slate-500")}>{err || t.search.hint}</p>
    </form>
  );
}
