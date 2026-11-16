export function Flash({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  return (
    <div className={`mb-6 whitespace-pre-line rounded-2xl border p-4 text-sm ${err ? "border-red-400/40 bg-red-500/10 text-red-600 dark:text-red-300" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
      {err || ok}
    </div>
  );
}
