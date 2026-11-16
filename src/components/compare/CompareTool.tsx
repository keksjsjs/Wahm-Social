"use client";

import { useState } from "react";
import type { Platform, Profile } from "@/lib/platforms/types";
import { compact, percent } from "@/lib/format";
import { useI18n } from "../I18nProvider";
import { Avatar, PlatformIcon } from "../ui";

type Row =
  | { ok: true; profile: Profile; metrics: Record<string, number | string | null>; source: string }
  | { ok: false; account: { platform: Platform; username: string }; error: string };

export function CompareTool({ initial, slots }: { initial: { platform: Platform; username: string }[]; slots: number }) {
  const { t, locale } = useI18n();
  const [accounts, setAccounts] = useState(initial.length ? initial : [{ platform: "tiktok" as Platform, username: "" }, { platform: "tiktok" as Platform, username: "" }]);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/compare", { method: "POST", body: JSON.stringify({ accounts: accounts.filter((a) => a.username.trim()) }) });
    const j = await res.json();
    setBusy(false);
    if (!j.ok) return setErr(j.error?.message ?? t.states.error);
    setRows(j.data.rows);
  }

  const metrics: [string, string, (v: number) => string][] = [
    ["followers", t.profile.followers, (v) => compact(v, locale)],
    ["following", t.profile.following, (v) => compact(v, locale)],
    ["posts", t.profile.posts, (v) => compact(v, locale)],
    ["likes", t.profile.likes, (v) => compact(v, locale)],
    ["avgViews", t.analytics.avgViews, (v) => compact(v, locale)],
    ["avgLikes", t.analytics.avgLikes, (v) => compact(v, locale)],
    ["avgComments", t.analytics.avgComments, (v) => compact(v, locale)],
    ["engagementRate", t.analytics.engagement, (v) => percent(v, 2)],
    ["postsPerWeek", t.analytics.frequency, (v) => String(v)],
    ["growthScore", t.analytics.score, (v) => String(v)],
  ];
  const okRows = rows.filter((r): r is Extract<Row, { ok: true }> => r.ok);
  const best = (k: string) => Math.max(...okRows.map((r) => Number(r.metrics[k] ?? -Infinity)));

  return (
    <div>
      <div className="card space-y-3 p-5">
        {accounts.map((a, i) => (
          <div key={i} className="flex gap-2">
            <select
              className="input w-36"
              value={a.platform}
              onChange={(e) => setAccounts(accounts.map((x, j) => (j === i ? { ...x, platform: e.target.value as Platform } : x)))}
            >
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
            <input
              className="input"
              dir="ltr"
              placeholder="@username"
              value={a.username}
              onChange={(e) => setAccounts(accounts.map((x, j) => (j === i ? { ...x, username: e.target.value } : x)))}
            />
            {accounts.length > 2 && (
              <button className="btn-ghost" onClick={() => setAccounts(accounts.filter((_, j) => j !== i))}>
                ✕
              </button>
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {accounts.length < slots && (
            <button className="btn-ghost" onClick={() => setAccounts([...accounts, { platform: "tiktok", username: "" }])}>
              + {t.compare.add}
            </button>
          )}
          <button className="btn-gold" onClick={run} disabled={busy}>
            {busy ? t.states.loading : t.compare.run}
          </button>
          {err && <span className="self-center text-sm text-rose-400">{err}</span>}
        </div>
      </div>
      {rows.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-start text-slate-400">{t.compare.metric}</th>
                {rows.map((r, i) => (
                  <th key={i} className="p-4">
                    {r.ok ? (
                      <div className="flex flex-col items-center gap-2">
                        <Avatar src={r.profile.avatarUrl} alt={r.profile.username} size={48} />
                        <span className="flex items-center gap-1 text-white" dir="ltr">
                          <PlatformIcon platform={r.profile.platform} className="h-3 w-3" />@{r.profile.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-rose-400">@{r.account.username}: {r.error}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map(([k, label, fmt]) => (
                <tr key={k} className="border-b border-white/[0.04]">
                  <td className="p-4 text-slate-300">{label}</td>
                  {rows.map((r, i) => {
                    const v = r.ok ? r.metrics[k] : null;
                    const isBest = r.ok && v !== null && Number(v) === best(k) && okRows.length > 1;
                    return (
                      <td key={i} className={`p-4 text-center font-bold ${isBest ? "text-gold-300" : "text-white"}`}>
                        {v === null || v === undefined ? "—" : fmt(Number(v))} {isBest && "★"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
