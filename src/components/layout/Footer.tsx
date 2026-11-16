import Link from "next/link";
import type { Dict } from "@/lib/i18n";
import { LogoMark } from "./Logo";

export function Footer({ t }: { t: Dict }) {
  const cols: { title: string; links: [string, string][] }[] = [
    {
      title: t.brand,
      links: [
        ["/explore", t.nav.explore],
        ["/download", t.nav.download],
        ["/stories", t.nav.stories],
        ["/analytics", t.nav.analytics],
      ],
    },
    {
      title: "Pro",
      links: [
        ["/pricing", t.nav.pricing],
        ["/compare", t.nav.compare],
        ["/watchlist", t.nav.watchlist],
        ["/api-docs", t.nav.api],
      ],
    },
    {
      title: t.nav.docs,
      links: [
        ["/docs", t.nav.docs],
        ["/blog", t.nav.blog],
        ["/tools/tiktok-downloader", "TikTok Downloader"],
        ["/tools/instagram-downloader", "Instagram Downloader"],
      ],
    },
    {
      title: t.footer.about,
      links: [
        ["/about", t.footer.about],
        ["/privacy", t.footer.privacy],
        ["/terms", t.footer.terms],
        ["/contact", t.footer.contact],
      ],
    },
  ];
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-navy-950/60">
      <div className="container-w grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-extrabold">
              <span className="gold-text">Wahm</span> Social
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{t.tagline}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-3 text-sm font-bold text-gold-300">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.05]">
        <div className="container-w flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
          <span>{t.footer.disclaimer}</span>
          <span>
            © {new Date().getFullYear()} Wahm · @iwahm — {t.footer.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
