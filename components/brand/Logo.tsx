import { FLOWER_GOLD, FLOWER_GREEN } from "./flower";

type Variant = "full" | "horizontal" | "icon" | "mono";

function Flower({ size, stroke, dot, title }: { size: number; stroke: string; dot: string; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="24" cy="14.2" rx="6.6" ry="9.4" transform={`rotate(${a} 24 24)`} fill="none" stroke={stroke} strokeWidth={2} />
      ))}
      <circle cx="24" cy="24" r="2.6" fill={dot} />
    </svg>
  );
}

/**
 * Nool & Mal logo, recreated as SVG.
 *  full       – stacked lockup (icon, two-line wordmark, gold rule, tagline)
 *  horizontal – icon + one-line wordmark for the navbar
 *  icon       – flower only
 *  mono       – single colour (inherits currentColor) for dark backgrounds
 */
export function Logo({ variant = "horizontal", className, size = 36 }: { variant?: Variant; className?: string; size?: number }) {
  const mono = variant === "mono";
  const stroke = mono ? "currentColor" : FLOWER_GREEN;
  const dot = FLOWER_GOLD;

  if (variant === "icon") return <span className={className}><Flower size={size} stroke={stroke} dot={dot} title="Nool & Mal" /></span>;

  if (variant === "full") {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className ?? ""}`} aria-label="Nool & Mal — Made to order · Sri Lanka" role="img">
        <Flower size={size} stroke={stroke} dot={dot} />
        <span className="mt-2 font-logo text-[2.6em] leading-[0.95] font-medium tracking-tight text-green-900">
          Nool
          <br />
          <span className="text-gold-600">&amp;</span> Mal
        </span>
        <span className="mt-3 flex w-full items-center gap-2" aria-hidden>
          <span className="h-px flex-1 bg-gold/70" />
          <span className="size-1.5 rounded-full bg-gold" />
          <span className="h-px flex-1 bg-gold/70" />
        </span>
        <span className="mt-2 text-[0.8em] tracking-wide text-green-900">Made to order · Sri Lanka</span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${mono ? "" : "text-green-900"} ${className ?? ""}`}>
      <Flower size={size} stroke={stroke} dot={dot} />
      <span className="font-logo text-[1.6rem] leading-none font-semibold tracking-tight">
        Nool <span className={mono ? "text-gold" : "text-gold-600"}>&amp;</span> Mal
      </span>
    </span>
  );
}
