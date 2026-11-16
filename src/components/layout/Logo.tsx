import Link from "next/link";
import { siteNow } from "@/lib/site/snapshot";

/** Frostly mark: a faceted ice-crystal inside a frosted rounded tile. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="fr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dc4ff" />
          <stop offset=".55" stopColor="#6378f6" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="fr-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#fr-bg)" />
      <rect x="3" y="3" width="58" height="29" rx="15" fill="url(#fr-shine)" />
      <g stroke="#fff" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M32 13v38M15.5 22.5l33 19M15.5 41.5l33-19" />
        <path d="M27 16l5 4 5-4M27 48l5-4 5 4M17 28.5l6.2-.9-2.3-5.8M47 35.5l-6.2.9 2.3 5.8M17 35.5l6.2.9-2.3 5.8M47 28.5l-6.2-.9 2.3-5.8" strokeWidth="2.6" />
      </g>
      <circle cx="32" cy="32" r="4.2" fill="#fff" />
    </svg>
  );
}

export function Wordmark() {
  const custom = siteNow().brand.siteName.en.trim();
  if (custom && custom !== "Frostly") return <span className="accent-text text-xl font-extrabold tracking-tight">{custom}</span>;
  return (
    <span className="text-xl font-extrabold tracking-tight">
      <span className="accent-text">Frost</span>
      <span className="text-ink">ly</span>
    </span>
  );
}

export function Logo({ label }: { label: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={label}>
      <LogoMark />
      <Wordmark />
    </Link>
  );
}
