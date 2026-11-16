import Link from "next/link";
import type { Dict } from "@/lib/i18n";
import { ProBadge } from "../ui";

/** Shows children blurred behind an upgrade CTA when `locked`. */
export function ProGate({ locked, t, children, compact = false }: { locked: boolean; t: Dict; children?: React.ReactNode; compact?: boolean }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {children && <div className="pointer-events-none select-none blur-sm opacity-40" aria-hidden>{children}</div>}
      <div className={children ? "absolute inset-0 grid place-items-center bg-navy-950/40" : ""}>
        <div className={`card mx-auto max-w-md text-center ${compact ? "p-5" : "p-8"}`}>
          <div className="mb-3 flex justify-center">
            <ProBadge />
          </div>
          <h3 className="text-lg font-bold text-white">{t.pro.lockedTitle}</h3>
          {!compact && <p className="mt-2 text-sm text-slate-400">{t.pro.lockedDesc}</p>}
          <Link href="/pricing" className="btn-gold mt-5">
            {t.pro.upgrade}
          </Link>
        </div>
      </div>
    </div>
  );
}
