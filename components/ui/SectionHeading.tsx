export function SectionHeading({ eyebrow, title, sub, align = "left", as: As = "h2" }: { eyebrow: string; title: string; sub?: string; align?: "left" | "center"; as?: "h1" | "h2" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <As className="h-display mt-3 text-4xl leading-[1.05] sm:text-5xl">{title}</As>
      {sub && <p className="mt-4 text-[15px] leading-7 text-muted">{sub}</p>}
    </div>
  );
}
