import { Accent } from "./Accent";

export function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="h-display mt-4 text-[2.75rem] leading-[1.02] sm:text-6xl">
        <Accent text={title} />
      </h1>
      {sub && <p className="mx-auto mt-5 max-w-xl text-[17px] leading-8 text-muted">{sub}</p>}
    </header>
  );
}
