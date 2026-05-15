export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 border-b border-line/70 dark:border-slate-800/70 pb-4">
      <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-slate-100">{title}</h1>
      {subtitle && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}
