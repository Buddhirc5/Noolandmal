import { Accent } from "./Accent";

export function SectionHeading({ eyebrow, title, sub, align = "center", as: As = "h2" }: { eyebrow: string; title: string; sub?: string; align?: "left" | "center"; as?: "h1" | "h2" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <As className="h-display mt-4 text-[2.5rem] leading-[1.04] sm:text-[3.4rem]">
        <Accent text={title} />
      </As>
      {sub && <p className={`mt-5 text-[16px] leading-7 text-muted ${align === "center" ? "mx-auto max-w-xl" : ""}`}>{sub}</p>}
    </div>
  );
}
