import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, eyebrow, children }: { title: string; subtitle?: string; eyebrow?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 mt-10 text-center">
      {eyebrow && <div className="mb-3 flex justify-center">{eyebrow}</div>}
      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-ink-3">{subtitle}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
