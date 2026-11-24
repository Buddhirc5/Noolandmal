"use client";
import { useState } from "react";

export interface Testimonial {
  quote: string;
  name: string;
  occasion: string;
}

// [background, text] pairs that meet WCAG AA
const TONES = [["#1F4D40", "#FFFFFF"], ["#F2D7D3", "#5A2A26"], ["#F1E3C8", "#4A3714"], ["#E6DCEA", "#3E2A47"]];

/** One large quote card with an avatar pill switcher (ceynk.lk style). */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const q = items[i];
  const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <figure className="card mx-auto max-w-3xl px-6 pt-10 pb-8 text-center sm:px-14">
      <span className="font-serif text-5xl leading-none text-ink/25" aria-hidden>
        &ldquo;
      </span>
      <blockquote className="mt-2 min-h-[9rem] text-[1.6rem] leading-[1.25] font-semibold tracking-[-0.02em] text-ink sm:text-[2rem]" aria-live="polite">
        {q.quote}
      </blockquote>
      <figcaption className="mt-6 text-[12px] font-medium tracking-[0.22em] text-muted uppercase">{q.occasion}</figcaption>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Choose a review">
        {items.map((t, j) =>
          j === i ? (
            <span key={j} role="tab" aria-selected="true" className="flex items-center gap-3 rounded-full bg-ink py-1.5 pr-5 pl-1.5 text-white">
              <span className="flex size-10 items-center justify-center rounded-full text-sm font-semibold ring-2 ring-white/30" style={{ background: TONES[j % TONES.length][0], color: TONES[j % TONES.length][1] }}>
                {initials(t.name)}
              </span>
              <span className="text-[15px] font-medium">{t.name}</span>
            </span>
          ) : (
            <button
              key={j}
              type="button"
              role="tab"
              aria-selected="false"
              aria-label={`Review from ${t.name}, ${t.occasion}`}
              onClick={() => setI(j)}
              className="flex size-12 items-center justify-center rounded-full bg-paper text-sm font-semibold ring-4 ring-paper transition-transform hover:scale-105"
            >
              <span className="flex size-10 items-center justify-center rounded-full" style={{ background: TONES[j % TONES.length][0], color: TONES[j % TONES.length][1] }}>
                {initials(t.name)}
              </span>
            </button>
          ),
        )}
      </div>
    </figure>
  );
}
