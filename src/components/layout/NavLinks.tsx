"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "../I18nProvider";
import { cx, ProBadge } from "../ui";

export function useNavItems() {
  const { t } = useI18n();
  return [
    { href: "/explore", label: t.nav.explore },
    { href: "/download", label: t.nav.download },
    { href: "/stories", label: t.nav.stories },
    { href: "/analytics", label: t.nav.analytics },
    { href: "/compare", label: t.nav.compare, pro: true },
    { href: "/watchlist", label: t.nav.watchlist, pro: true },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/blog", label: t.nav.blog },
  ];
}

export function NavLinks() {
  const items = useNavItems();
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={cx(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition",
            path.startsWith(it.href) ? "bg-white/5 text-gold-300" : "text-slate-300 hover:text-white",
          )}
        >
          {it.label}
          {it.pro && <ProBadge />}
        </Link>
      ))}
    </nav>
  );
}

export function MobileMenu({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const items = useNavItems();
  const { t } = useI18n();
  return (
    <div className="lg:hidden">
      <button className="btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-white/10 bg-navy-950/95 p-4 backdrop-blur">
          <div className="grid grid-cols-2 gap-2">
            {[...items, authed ? { href: "/account", label: t.nav.account } : { href: "/login", label: t.nav.login }].map((it) => (
              <Link key={it.href} href={it.href} onClick={() => setOpen(false)} className="card px-3 py-3 text-sm text-slate-200">
                {it.label} {"pro" in it && it.pro ? <ProBadge /> : null}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
