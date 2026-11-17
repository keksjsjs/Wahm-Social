import type { ContactSettings } from "@/lib/site/types";

const LABELS: [keyof ContactSettings, string][] = [
  ["x", "X"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["youtube", "YouTube"],
  ["telegram", "Telegram"],
  ["whatsapp", "WhatsApp"],
  ["snapchat", "Snapchat"],
];

/** Admin-managed social links + contact email (hidden when empty). */
export function SocialLinks({ c }: { c: ContactSettings }) {
  const links = LABELS.filter(([k]) => /^https?:\/\//.test(c[k] ?? ""));
  if (!links.length && !c.email) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {links.map(([k, label]) => (
        <a key={k} href={c[k]} target="_blank" rel="noopener noreferrer me" className="chip text-ink-3 hover:text-ink">
          {label}
        </a>
      ))}
      {c.email && (
        <a href={`mailto:${c.email}`} className="chip text-ink-3 hover:text-ink" dir="ltr">
          ✉ {c.email}
        </a>
      )}
    </div>
  );
}
