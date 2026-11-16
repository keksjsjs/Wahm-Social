import type { ReactNode } from "react";
import { cx } from "./cx";

export function Badge({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "gold" | "green" | "red" | "blue"; className?: string }) {
  const tones = {
    default: "border-line bg-ink/5 text-ink-2",
    gold: "border-accent-500/40 bg-accent-500/10 text-accent-600 dark:text-accent-300",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    red: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tones[tone], className)}>{children}</span>;
}
