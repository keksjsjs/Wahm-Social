import type { ReactNode } from "react";

export function EmptyState({ icon = "◎", title, desc, action }: { icon?: ReactNode; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-accent-500/30 bg-accent-500/10 text-2xl text-accent-600 dark:text-accent-300">{icon}</div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {desc && <p className="mt-2 max-w-md text-sm leading-7 text-ink-3">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
