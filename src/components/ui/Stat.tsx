import type { ReactNode } from "react";

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="card px-4 py-3 text-center">
      <div className="text-xl font-bold text-ink sm:text-2xl">{value}</div>
      <div className="mt-0.5 text-xs text-ink-3">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-accent-500 dark:text-accent-400">{hint}</div>}
    </div>
  );
}
