"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Platform } from "@/lib/platforms/types";
import { useI18n } from "../I18nProvider";
import { cx, PlatformIcon } from "../ui";

/** Username box that jumps to a specific profile tab (stories / analytics). */
export function QuickJump({ tab, platforms = ["tiktok", "instagram"] }: { tab: string; platforms?: Platform[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>(platforms[platforms.length - 1]);
  const [u, setU] = useState("");
  return (
    <form
      className="mx-auto max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        const name = u.trim().replace(/^@/, "").toLowerCase();
        if (/^[a-z0-9._]{1,30}$/.test(name)) router.push(`/${platform}/${name}/${tab}`);
      }}
    >
      <div className="mb-3 flex justify-center gap-2">
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlatform(p)}
            className={cx("chip", platform === p && "border-accent-400/60 text-accent-600 dark:text-accent-200")}
          >
            <PlatformIcon platform={p} className="h-3 w-3" /> {p === "tiktok" ? t.search.tiktok : t.search.instagram}
          </button>
        ))}
      </div>
      <div className="card flex gap-2 p-2">
        <input className="min-w-0 flex-1 bg-transparent px-3 text-ink focus:outline-none" dir="ltr" placeholder="@username" value={u} onChange={(e) => setU(e.target.value)} />
        <button className="btn-primary">{t.search.button}</button>
      </div>
    </form>
  );
}
