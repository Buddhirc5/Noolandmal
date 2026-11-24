"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Step {
  title: string;
  body: string;
  image: string;
  alt: string;
}

/** ceynk-style carousel: mono "LABEL • 01 / 04" header, round arrows, photo cards. */
export function StepsCarousel({ label, steps }: { label: string; steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const go = (d: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(steps.length - 1, idx + d));
    const child = el.children[next] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const w = (first?.offsetWidth ?? 1) + 20;
    setIdx(Math.min(steps.length - 1, Math.round(el.scrollLeft / w)));
  };
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[13px] tracking-[0.12em] text-muted uppercase" aria-live="polite">
          {label} <span className="mx-1.5 inline-block size-1.5 rounded-full bg-muted/50 align-middle" /> {pad(idx + 1)} / {pad(steps.length)}
        </p>
        <div className="flex gap-2">
          <button type="button" className="flex size-11 items-center justify-center rounded-full bg-surface text-ink transition-opacity disabled:opacity-35" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" className="flex size-11 items-center justify-center rounded-full bg-surface text-ink transition-opacity disabled:opacity-35" onClick={() => go(1)} disabled={idx >= steps.length - 1} aria-label="Next">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="-mx-4 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label={label}
      >
        {steps.map((s, i) => (
          <article key={s.title} className="card flex w-[82%] shrink-0 snap-start flex-col p-3 sm:w-[46%] lg:w-[calc(33.333%-14px)]" aria-roledescription="slide" aria-label={`${i + 1} of ${steps.length}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-surface-2">
              <Image src={s.image} alt={s.alt} fill sizes="(max-width: 640px) 82vw, 33vw" className="object-cover object-top" />
            </div>
            <div className="px-3 pt-5 pb-4">
              <p className="font-mono text-[12px] tracking-[0.12em] text-muted">STEP {pad(i + 1)}</p>
              <h3 className="mt-2 text-[1.4rem] leading-tight font-semibold tracking-[-0.02em] text-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-muted">{s.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
