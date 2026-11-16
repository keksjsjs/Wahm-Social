export function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card space-y-4 p-6">
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {desc && <p className="mt-1 text-sm text-ink-3">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

/** A section whose form posts to a panel API route. */
export function FormSection({ title, desc, action, children, multipart }: { title: string; desc?: string; action: string; children: React.ReactNode; multipart?: boolean }) {
  return (
    <Section title={title} desc={desc}>
      <form method="post" action={action} encType={multipart ? "multipart/form-data" : undefined} className="space-y-4">
        {children}
      </form>
    </Section>
  );
}
