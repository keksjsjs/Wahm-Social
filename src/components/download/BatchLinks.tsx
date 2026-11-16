"use client";

import { useState } from "react";
import { useI18n } from "../I18nProvider";
import { proxied } from "@/lib/mediaUrl";

interface Item {
  id: string;
  author: string;
  type: string;
  cover: string;
  download: string | null;
}

export function BatchLinks() {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setErr("");
    const lines = text.split(/\s+/).filter(Boolean);
    const isUser = lines.length === 1 && !/^https?:/.test(lines[0]);
    const body = isUser
      ? { platform: lines[0].startsWith("ig:") ? "instagram" : "tiktok", username: lines[0].replace(/^(ig|tt):/, "") }
      : { urls: lines };
    const res = await fetch("/api/batch", { method: "POST", body: JSON.stringify(body) });
    const j = await res.json();
    setBusy(false);
    if (!j.ok) return setErr(j.error?.message ?? t.states.error);
    setItems(j.data.items);
  }

  return (
    <div className="card p-6">
      <textarea
        className="input min-h-32 font-mono"
        dir="ltr"
        placeholder={"https://www.tiktok.com/@user/video/...\nhttps://www.instagram.com/p/...\n— or — khaby.lame  /  ig:natgeo"}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        <button className="btn-gold" onClick={run} disabled={busy || !text.trim()}>
          {busy ? t.states.loading : t.download.go}
        </button>
        {err && <span className="text-sm text-rose-400">{err}</span>}
      </div>
      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {items.map((it, i) => (
            <a key={it.id + i} href={it.download ?? "#"} className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={proxied(it.cover)} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[11px] text-white">⬇ {it.type}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
