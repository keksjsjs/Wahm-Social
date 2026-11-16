export function ProBadge({ label = "PRO" }: { label?: string }) {
  return <span className="rounded-md bg-accent-gradient px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white">{label}</span>;
}
