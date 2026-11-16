import Link from "next/link";
import type { ReactNode } from "react";
import { proxied } from "@/lib/mediaUrl";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("card", className)}>{children}</div>;
}

export function Badge({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "gold" | "green" | "red" | "blue"; className?: string }) {
  const tones = {
    default: "border-white/10 bg-white/5 text-slate-300",
    gold: "border-gold-500/40 bg-gold-500/10 text-gold-300",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    red: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tones[tone], className)}>{children}</span>;
}

export function ProBadge({ label = "PRO" }: { label?: string }) {
  return <span className="rounded-md bg-gold-gradient px-1.5 py-0.5 text-[10px] font-black tracking-wider text-navy-950">{label}</span>;
}

export function VerifiedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cx("inline-block text-sky-400", className)} aria-label="verified">
      <path
        fill="currentColor"
        d="M12 1.5l2.6 2 3.3-.3 1 3.1 2.8 1.8-1 3.1 1 3.1-2.8 1.8-1 3.1-3.3-.3L12 22.5l-2.6-2-3.3.3-1-3.1-2.8-1.8 1-3.1-1-3.1 2.8-1.8 1-3.1 3.3.3z"
      />
      <path fill="#fff" d="M10.6 15.6l-3.2-3.2 1.4-1.4 1.8 1.8 4.6-4.6 1.4 1.4z" />
    </svg>
  );
}

export function Avatar({ src, alt, size = 96, ring = true }: { src?: string; alt: string; size?: number; ring?: boolean }) {
  return (
    <div className={cx("shrink-0 overflow-hidden rounded-full bg-navy-700", ring && "p-[3px] bg-gold-gradient")} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={proxied(src) || "/api/placeholder?seed=avatar"} alt={alt} width={size} height={size} className="h-full w-full rounded-full object-cover bg-navy-800" loading="lazy" referrerPolicy="no-referrer" />
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="card px-4 py-3 text-center">
      <div className="text-xl font-bold text-white sm:text-2xl">{value}</div>
      <div className="mt-0.5 text-xs text-slate-400">{label}</div>
      {hint && <div className="mt-1 text-[11px] text-gold-400">{hint}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

export function EmptyState({ icon = "◎", title, desc, action }: { icon?: ReactNode; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-2xl text-gold-300">{icon}</div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {desc && <p className="mt-2 max-w-md text-sm leading-7 text-slate-400">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, eyebrow, children }: { title: string; subtitle?: string; eyebrow?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 mt-10 text-center">
      {eyebrow && <div className="mb-3 flex justify-center">{eyebrow}</div>}
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-slate-400">{subtitle}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function TabLinks({ tabs, active }: { tabs: { href: string; label: string; key: string; pro?: boolean }[]; active: string }) {
  return (
    <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-white/10 px-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          scroll={false}
          className={cx(
            "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
            active === t.key ? "border-gold-400 text-gold-300" : "border-transparent text-slate-400 hover:text-white",
          )}
        >
          {t.label}
          {t.pro && <ProBadge />}
        </Link>
      ))}
    </nav>
  );
}

export function PlatformIcon({ platform, className = "h-4 w-4" }: { platform: "tiktok" | "instagram"; className?: string }) {
  if (platform === "tiktok")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.3 7.3 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
