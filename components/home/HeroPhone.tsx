"use client";
import { useEffect, useState } from "react";
import { DressFigure } from "@/components/customiser/DressFigure";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import type { FigureLayer } from "@/lib/figure";

export interface HeroPreset {
  name: string;
  colors: Record<string, string>;
  min: number;
  max: number;
}

export function HeroPhone({ title, layers, presets }: { title: string; layers: FigureLayer[]; presets: HeroPreset[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // start cycling colours only once the page has settled, so it never competes with loading
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setI((x) => (x + 1) % presets.length);
      id = setInterval(() => setI((x) => (x + 1) % presets.length), 2800);
    }, 6000);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [paused, presets.length]);
  const p = presets[i];
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,var(--color-gold-50),transparent)]" aria-hidden />
      <div className="rounded-[44px] border-[10px] border-ink bg-ink p-0 shadow-[0_30px_60px_-20px_rgb(27_42_38/0.45)]">
        <div className="relative overflow-hidden rounded-[34px] bg-ivory">
          <div className="absolute top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" aria-hidden />
          <div className="px-4 pt-10 pb-4">
            <p className="text-[10px] tracking-[0.2em] text-muted uppercase">Customise</p>
            <p className="text-lg leading-tight font-semibold tracking-tight text-green-900">{title}</p>
            <div className="relative mt-1 h-[300px] rounded-2xl bg-paper">
              <DressFigure layers={layers} colorOf={(r) => p.colors[r] ?? "#ccc"} sheen={0.3} className="h-full w-full" idPrefix="hero" title={`${title} in ${p.name}`} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-ink">{p.name}</span>
              <div className="flex gap-1.5">
                {presets.map((x, j) => (
                  <button
                    key={x.name}
                    type="button"
                    onClick={() => {
                      setI(j);
                      setPaused(true);
                    }}
                    aria-label={`Show ${x.name}`}
                    aria-pressed={i === j}
                    className={`size-6 rounded-full border-2 border-paper transition-shadow ${i === j ? "ring-2 ring-green-900" : "ring-1 ring-line"}`}
                    style={{ background: Object.values(x.colors)[0] }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-green-900 px-3.5 py-2.5 text-white">
              <div>
                <p className="text-[10px] text-white/70">Estimated</p>
                <p className="text-[13px] font-medium whitespace-nowrap">
                  LKR <AnimatedNumber value={p.min} /> – <AnimatedNumber value={p.max} />
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gold px-3 py-1.5 text-xs font-medium whitespace-nowrap text-ink">Get quote</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
