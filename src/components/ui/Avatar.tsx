import { proxied } from "@/lib/mediaUrl";
import { cx } from "./cx";

export function Avatar({ src, alt, size = 96, ring = true }: { src?: string; alt: string; size?: number; ring?: boolean }) {
  return (
    <div className={cx("shrink-0 overflow-hidden rounded-full bg-surface-2", ring && "p-[3px] bg-accent-gradient")} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={proxied(src) || "/api/placeholder?seed=avatar"} alt={alt} width={size} height={size} className="h-full w-full rounded-full object-cover bg-surface-2" loading="lazy" referrerPolicy="no-referrer" />
    </div>
  );
}
