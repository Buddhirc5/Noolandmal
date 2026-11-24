export function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="h-display mt-3 text-5xl leading-[1.02] sm:text-6xl">{title}</h1>
      {sub && <p className="mt-5 text-[17px] leading-8 text-muted">{sub}</p>}
    </header>
  );
}
