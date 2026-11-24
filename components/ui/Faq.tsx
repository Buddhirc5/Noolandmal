"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

/** Stacked question cards; one open at a time with a smooth height animation. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3" data-reveal-stagger>
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} className={`rounded-[24px] transition-colors duration-300 ${on ? "bg-surface-2" : "bg-surface"}`}>
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-6 py-4 text-left text-[17px] font-medium text-ink"
              >
                {f.q}
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-[transform,background-color] duration-300 ${on ? "rotate-180 bg-ink text-white" : "bg-paper"}`}>
                  <ChevronDown className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} role="region" className={`grid transition-[grid-template-rows] duration-400 ease-out ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className={`px-6 pb-6 text-[15px] leading-7 text-muted transition-opacity duration-300 ${on ? "opacity-100" : "opacity-0"}`}>{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
