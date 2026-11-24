"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function StepsCarousel({ steps }: { steps: { title: string; body: string; visual: React.ReactNode }[] }) {
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
    const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
    setIdx(Math.round(el.scrollLeft / (w + 16)));
  };
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label="How it works"
      >
        {steps.map((s, i) => (
          <article
            key={s.title}
            className="card flex w-[85%] shrink-0 snap-start flex-col overflow-hidden sm:w-[46%] lg:w-[calc(25%-12px)]"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${steps.length}`}
          >
            <div className="flex h-44 items-center justify-center border-b border-line bg-ivory/60 p-5">{s.visual}</div>
            <div className="p-5">
              <p className="font-serif text-3xl text-gold-600">{pad(i + 1)}</p>
              <h3 className="mt-1 text-lg font-semibold text-green-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between lg:hidden">
        <p className="text-sm tabular-nums text-muted" aria-live="polite">
          <span className="font-medium text-green-900">{pad(Math.min(idx, steps.length - 1) + 1)}</span> / {pad(steps.length)}
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary size-11 px-0" onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous step">
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <button type="button" className="btn-secondary size-11 px-0" onClick={() => go(1)} disabled={idx >= steps.length - 1} aria-label="Next step">
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
