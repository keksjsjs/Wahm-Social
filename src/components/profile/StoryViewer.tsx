"use client";

import { useEffect, useState } from "react";
import type { Story } from "@/lib/platforms/types";
import { proxied } from "@/lib/mediaUrl";
import { useI18n } from "../I18nProvider";
import { timeAgo } from "@/lib/format";

/** Tap-through story viewer with progress bars and a download button. */
export function StoryViewer({ stories, downloadable }: { stories: Story[]; downloadable: boolean }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open === null) return;
    setProgress(0);
    const s = stories[open];
    if (s.type === "video") return;
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 2)), 100);
    return () => clearInterval(id);
  }, [open, stories]);

  useEffect(() => {
    if (open !== null && progress >= 100) setOpen(open + 1 < stories.length ? open + 1 : null);
  }, [progress, open, stories.length]);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
        {stories.map((s, i) => (
          <button key={s.id} onClick={() => setOpen(i)} className="group relative aspect-[9/16] overflow-hidden rounded-xl border border-accent-500/30 bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proxied(s.thumbnail)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
            <span className="absolute bottom-1 start-1 rounded bg-black/60 px-1.5 text-[10px] text-white">
              {s.type === "video" ? "▶" : "◻"} {timeAgo(s.takenAt, locale)}
            </span>
          </button>
        ))}
      </div>
      {open !== null && stories[open] && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <div className="relative aspect-[9/16] h-[85vh] max-w-full overflow-hidden rounded-2xl bg-black" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
              {stories.map((_, i) => (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded bg-white/40">
                  <div className="h-full bg-white" style={{ width: i < open ? "100%" : i === open ? `${progress}%` : "0%" }} />
                </div>
              ))}
            </div>
            {stories[open].type === "video" ? (
              <video src={proxied(stories[open].url)} className="h-full w-full object-contain" autoPlay playsInline controls onEnded={() => setProgress(100)} />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={proxied(stories[open].url)} alt="" className="h-full w-full object-contain" />
            )}
            <button className="absolute inset-y-0 start-0 w-1/3" aria-label="prev" onClick={() => setOpen(Math.max(0, open - 1))} />
            <button className="absolute inset-y-0 end-0 w-1/3" aria-label="next" onClick={() => setProgress(100)} />
            {downloadable && (
              <a href={proxied(stories[open].url)} download className="btn-primary btn-sm absolute bottom-4 start-1/2 z-10 -translate-x-1/2 rtl:translate-x-1/2">
                ⬇ {t.post.download}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
