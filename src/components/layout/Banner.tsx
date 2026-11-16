import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/site/types";

/** Announcement bar edited from the admin panel. */
export function Banner({ s, locale }: { s: SiteSettings; locale: Locale }) {
  const t = s.texts;
  const text = (t.banner[locale] || t.banner.ar || t.banner.en || "").trim();
  if (!t.bannerEnabled || !text) return null;
  const body = <span className="font-semibold">{text}</span>;
  return (
    <div className="bg-accent-gradient px-4 py-2 text-center text-sm text-white" data-site-banner>
      {t.bannerLink && /^(https?:\/\/|\/)/.test(t.bannerLink) ? (
        <Link href={t.bannerLink} className="underline-offset-4 hover:underline">
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}
