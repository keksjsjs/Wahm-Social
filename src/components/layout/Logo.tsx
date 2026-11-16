import Link from "next/link";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3dc9b" />
          <stop offset=".5" stopColor="#d4a944" />
          <stop offset="1" stopColor="#8f6a1f" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0a1228" />
      <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="url(#wg)" strokeOpacity=".5" />
      <path d="M12 18l8 28 6-18 6 18 6-18 6 18 8-28" fill="none" stroke="url(#wg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ label }: { label: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={label}>
      <LogoMark />
      <span className="text-lg font-extrabold tracking-tight">
        <span className="gold-text">Wahm</span> <span className="text-white">Social</span>
      </span>
    </Link>
  );
}
