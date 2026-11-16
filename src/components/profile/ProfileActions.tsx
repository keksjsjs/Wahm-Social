"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Platform } from "@/lib/platforms/types";
import { useI18n } from "../I18nProvider";
import { ProBadge } from "../ui";

export function ProfileActions({ platform, username, canPro }: { platform: Platform; username: string; canPro: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [msg, setMsg] = useState("");

  async function watch() {
    if (!canPro) return router.push("/pricing");
    const res = await fetch("/api/watchlist", { method: "POST", body: JSON.stringify({ platform, username }) });
    const j = await res.json();
    setMsg(j.ok ? "✓" : j.error?.message ?? "!");
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ url, title: `@${username}` });
      else {
        await navigator.clipboard.writeText(url);
        setMsg(t.profile.copied);
      }
    } catch {}
  }

  return (
    <div className="flex flex-row flex-wrap justify-center gap-2 sm:flex-col">
      <button onClick={watch} className="btn-ghost btn-sm">
        ★ {t.profile.addWatch} {!canPro && <ProBadge />}
      </button>
      <Link href={canPro ? `/compare?a=${platform}:${username}` : "/pricing"} className="btn-ghost btn-sm">
        ⇄ {t.profile.compare} {!canPro && <ProBadge />}
      </Link>
      <a href={canPro ? `/api/export/${platform}/${username}` : "/pricing"} className="btn-ghost btn-sm">
        ⤓ {t.profile.exportCsv} {!canPro && <ProBadge />}
      </a>
      <button onClick={share} className="btn-ghost btn-sm">
        ↗ {t.profile.share}
      </button>
      {msg && <span className="text-center text-xs text-accent-600 dark:text-accent-300">{msg}</span>}
    </div>
  );
}
