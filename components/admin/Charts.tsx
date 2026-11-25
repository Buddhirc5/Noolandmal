"use client";
import { useState } from "react";
import { cn } from "@/lib/format";

export interface Series {
  key: string;
  name: string;
  color: string;
}

import { CHART } from "@/lib/chart-colors";

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
const compact = (n: number) => (n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${Math.round(n / 1000)}K` : n.toLocaleString("en-LK"));

/**
 * Columns from a single baseline (grouped when there are several series).
 * Hover or focus a group for exact values; the page also shows a table.
 */
export function ColumnChart({
  rows,
  series,
  label,
  currency = false,
  height = 220,
  tickEvery = 1,
}: {
  rows: { label: string; full?: string; values: Record<string, number> }[];
  series: Series[];
  label: string;
  /** show values as LKR */
  currency?: boolean;
  height?: number;
  tickEvery?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const format = (n: number) => (currency ? "LKR " : "") + Math.round(n).toLocaleString("en-LK");
  // counts get whole-number ticks (never "0.5 visitors")
  const max = Math.max(currency ? 0 : 4, niceMax(Math.max(0, ...rows.flatMap((r) => series.map((s) => r.values[s.key] ?? 0)))));
  const ticks = [0, max / 2, max];
  return (
    <figure aria-label={label}>
      {series.length > 1 && (
        <figcaption className="mb-5 flex flex-wrap gap-4 text-[13px] text-muted">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </figcaption>
      )}
      <div className="flex gap-2 pt-2">
        <div className="relative w-10 shrink-0 text-right text-[11px] text-muted tabular-nums" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>
              {compact(t)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="relative" style={{ height }}>
            {ticks.map((t) => (
              <span key={t} className="absolute inset-x-0 h-px bg-black/[0.07]" style={{ bottom: `${(t / max) * 100}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end">
              {rows.map((r, i) => (
                <div
                  key={r.label + i}
                  tabIndex={0}
                  role="img"
                  aria-label={`${r.full ?? r.label}: ${series.map((s) => `${s.name} ${format(r.values[s.key] ?? 0)}`).join(", ")}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className={cn("relative flex h-full flex-1 items-end justify-center gap-[2px] rounded-md outline-none", hover === i && "bg-black/[0.035]")}
                >
                  {series.map((s) => {
                    const v = r.values[s.key] ?? 0;
                    return <span key={s.key} className="w-full max-w-6 rounded-t-[4px] transition-[height] duration-500" style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 2 : 0, background: s.color }} />;
                  })}
                  {hover === i && (
                    <span className={cn("pointer-events-none absolute bottom-full z-10 mb-2 w-max min-w-36 rounded-xl bg-ink px-3 py-2 text-left text-xs text-white shadow-lg", i > rows.length / 2 ? "right-0" : "left-0")}>
                      <span className="block font-medium">{r.full ?? r.label}</span>
                      {series.map((s) => (
                        <span key={s.key} className="mt-1 flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-white/75">
                            <span className="size-2 rounded-[2px]" style={{ background: s.color }} />
                            {s.name}
                          </span>
                          <b className="tabular-nums">{format(r.values[s.key] ?? 0)}</b>
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex text-[11px] text-muted">
            {rows.map((r, i) => (
              <span key={r.label + i} className="flex-1 truncate text-center">
                {i % tickEvery === 0 ? r.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

/**
 * Horizontal bars for the visit-to-order steps. Visitors can make several codes,
 * so later steps are shown as a share of codes made rather than of visitors.
 */
export function FunnelBars({ steps, baseFrom = 2 }: { steps: { label: string; value: number }[]; baseFrom?: number }) {
  const top = Math.max(1, ...steps.map((s) => s.value));
  const pct = (i: number) => {
    const base = i < baseFrom ? steps[0]?.value : steps[baseFrom]?.value;
    return i === 0 || i === baseFrom || !base ? null : `${Math.round((steps[i].value / base) * 100)}%`;
  };
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={s.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-ink">{s.label}</span>
          <span className="h-6 overflow-hidden rounded-r-[4px] bg-black/[0.04]">
            <span className="block h-full rounded-r-[4px]" style={{ width: `${Math.max(s.value ? 1.5 : 0, (s.value / top) * 100)}%`, background: CHART.pink }} />
          </span>
          <span className="w-24 text-right tabular-nums">
            <b className="font-semibold">{s.value.toLocaleString("en-LK")}</b>
            {pct(i) && <span className="ml-1 text-xs text-muted">{pct(i)}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
