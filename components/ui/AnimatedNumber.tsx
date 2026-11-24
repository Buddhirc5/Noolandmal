"use client";
import { useEffect, useRef } from "react";

const fmt = (n: number) => Math.round(n).toLocaleString("en-LK");

/** Tweens between numbers (≈250ms) by writing to the DOM directly — no React re-render per frame. */
export function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = from.current;
    from.current = value;
    if (a === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 260);
      el.textContent = fmt(a + (value - a) * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span ref={ref} className="tabular-nums">
      {fmt(value)}
    </span>
  );
}
