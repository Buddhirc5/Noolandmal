"use client";
import { useEffect, useState } from "react";

export interface Testimonial {
  quote: string;
  name: string;
  occasion: string;
}

// [background, text] pairs that meet WCAG AA
const TONES = [["#0A0A0A", "#FFFFFF"], ["#FFD6EA", "#520630"], ["#CE117D", "#FFFFFF"], ["#FA90C9", "#520630"]];
const DURATION = 7000;

/** One large quote that crossfades; the active avatar expands into a pill with a progress bar. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setI((x) => (x + 1) % items.length), DURATION);
    return () => clearTimeout(id);
  }, [i, paused, items.length]);
  const q = items[i];
  const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <figure className="card mx-auto max-w-3xl px-6 pt-10 pb-8 text-center sm:px-14" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} data-reveal>
      <span className="font-serif text-6xl leading-none text-pink/40" aria-hidden>
        &ldquo;
      </span>
      <div className="grid min-h-[10rem] items-center">
        <blockquote key={i} className="animate-crossfade text-[1.55rem] leading-[1.25] font-semibold tracking-[-0.02em] text-ink sm:text-[2rem]" aria-live="polite">
          {q.quote}
        </blockquote>
      </div>
      <figcaption key={`c${i}`} className="animate-crossfade mt-6 text-[12px] font-medium tracking-[0.22em] text-muted uppercase">
        {q.occasion}
      </figcaption>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Choose a review">
        {items.map((t, j) => {
          const on = j === i;
          const [bg, fg] = TONES[j % TONES.length];
          return (
            <button
              key={j}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={`Review from ${t.name}, ${t.occasion}`}
              onClick={() => setI(j)}
              className={`relative flex h-12 items-center overflow-hidden rounded-full transition-[max-width,background-color] duration-500 ease-out ${on ? "max-w-[260px] bg-ink pr-5 pl-1 text-white" : "max-w-12 bg-paper"}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ background: bg, color: fg }}>
                {initials(t.name)}
              </span>
              <span className={`ml-3 text-[15px] font-medium whitespace-nowrap transition-opacity duration-300 ${on ? "opacity-100 delay-150" : "opacity-0"}`}>{t.name}</span>
              {on && !paused && <span key={i} className="absolute inset-x-5 bottom-1.5 h-0.5 origin-left rounded-full bg-pink [animation:progress_7s_linear_both]" aria-hidden />}
            </button>
          );
        })}
      </div>
    </figure>
  );
}
