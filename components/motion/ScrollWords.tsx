"use client";
import { useEffect, useRef } from "react";

/** Words light up one by one as the paragraph scrolls through the viewport. "*word*" = italic accent. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).map((w) => ({ accent: /^\*.*\*[.,!?]?$/.test(w) || (w.startsWith("*") && w.endsWith("*")), raw: w }));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the paragraph's top is at 85% of the viewport, 1 when its bottom reaches 45%
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      const lit = p * spans.length;
      spans.forEach((s, i) => (s.style.opacity = String(Math.min(1, Math.max(0.16, lit - i + 0.16)))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const m = w.raw.match(/^\*(.+?)\*([.,!?]?)$/);
        return (
          <span key={i}>
            <span data-w className="transition-opacity duration-300" style={{ opacity: 0.16 }}>
              {m ? (
                <>
                  <em className="accent">{m[1]}</em>
                  {m[2]}
                </>
              ) : (
                w.raw
              )}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}
