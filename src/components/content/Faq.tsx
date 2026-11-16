export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((f) => (
        <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink">
            {f.q}
            <span className="text-accent-500 dark:text-accent-400 transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-7 text-ink-3">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
