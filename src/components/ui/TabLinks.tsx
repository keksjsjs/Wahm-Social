import Link from "next/link";
import { cx } from "./cx";
import { ProBadge } from "./ProBadge";

export function TabLinks({ tabs, active }: { tabs: { href: string; label: string; key: string; pro?: boolean }[]; active: string }) {
  return (
    <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-line px-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          scroll={false}
          className={cx(
            "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
            active === t.key ? "border-accent-400 text-accent-600 dark:text-accent-300" : "border-transparent text-ink-3 hover:text-ink",
          )}
        >
          {t.label}
          {t.pro && <ProBadge />}
        </Link>
      ))}
    </nav>
  );
}
