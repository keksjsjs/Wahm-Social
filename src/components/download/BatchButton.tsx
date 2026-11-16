"use client";

import Link from "next/link";
import { useState } from "react";
import type { Platform } from "@/lib/platforms/types";
import { useI18n } from "../I18nProvider";
import { ProBadge } from "../ui";

interface Item {
  id: string;
  download: string | null;
}

/** Fetches the batch manifest then triggers downloads one at a time (Pro). */
export function BatchButton({ platform, username, canBatch, disabled }: { platform: Platform; username: string; canBatch: boolean; disabled?: boolean }) {
  const { t } = useI18n();
  const [state, setState] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState("");

  if (!canBatch)
    return (
      <Link href="/pricing" className="btn-ghost btn-sm">
        ⇊ {t.profile.batch} <ProBadge />
      </Link>
    );

  async function run() {
    setErr("");
    const res = await fetch("/api/batch", { method: "POST", body: JSON.stringify({ platform, username }) });
    const j = await res.json();
    if (!j.ok) return setErr(j.error?.message ?? t.states.error);
    const items: Item[] = j.data.items.filter((i: Item) => i.download);
    setState({ done: 0, total: items.length });
    for (let i = 0; i < items.length; i++) {
      const a = document.createElement("a");
      a.href = items[i].download!;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setState({ done: i + 1, total: items.length });
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  return (
    <div className="flex items-center gap-2">
      {err && <span className="text-xs text-rose-400">{err}</span>}
      {state && (
        <span className="text-xs text-accent-600 dark:text-accent-300">
          {state.done}/{state.total}
        </span>
      )}
      <button onClick={run} disabled={disabled || (state !== null && state.done < state.total)} className="btn-primary btn-sm">
        ⇊ {t.profile.batch}
      </button>
    </div>
  );
}
