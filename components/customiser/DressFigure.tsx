// Renders the parametric dress (lib/figure.ts) as React SVG so colour changes animate.
import { buildFigure, patternDefs, VIEWBOX, type FigureLayer } from "@/lib/figure";

export function DressFigure({
  layers,
  colorOf,
  sheen = 0.15,
  className,
  title,
  idPrefix = "f",
}: {
  layers: FigureLayer[];
  colorOf: (region: string) => string;
  sheen?: number;
  className?: string;
  title?: string;
  idPrefix?: string;
}) {
  const shapes = buildFigure(layers);
  const patterns = new Map<string, string>();
  for (const s of shapes) {
    if (!s.texture) continue;
    const color = s.region ? colorOf(s.region) : (s.fill ?? "#888888");
    const id = `${idPrefix}-${s.texture}-${color.replace("#", "")}`;
    if (!patterns.has(id)) patterns.set(id, patternDefs(id, color.startsWith("#") ? color : "#888888", s.texture));
  }
  return (
    <svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} className={className} role="img" aria-label={title ?? "Dress preview"}>
      <defs>
        <linearGradient id={`${idPrefix}-sheen`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0.05 + sheen} />
          <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.1 + sheen / 2} />
        </linearGradient>
        <g dangerouslySetInnerHTML={{ __html: [...patterns.values()].join("") }} />
      </defs>
      {shapes.map((s, i) => {
        const color = s.region ? colorOf(s.region) : (s.fill ?? "#000");
        const op = s.opacity ?? 1;
        if (s.line)
          return <path key={i} d={s.d} fill="none" stroke={color} strokeWidth={s.width ?? 2} strokeLinecap="round" opacity={op} style={{ transition: "stroke 200ms ease" }} />;
        const pid = s.texture ? `${idPrefix}-${s.texture}-${color.replace("#", "")}` : null;
        return (
          <g key={i}>
            <path d={s.d} fill={color} opacity={op} stroke="rgba(0,0,0,0.16)" strokeWidth={0.8} style={{ transition: "fill 220ms ease" }} />
            {pid && <path d={s.d} fill={`url(#${pid})`} opacity={Math.min(1, op + 0.3)} />}
            {s.sheen && <path d={s.d} fill={`url(#${idPrefix}-sheen)`} />}
          </g>
        );
      })}
    </svg>
  );
}
