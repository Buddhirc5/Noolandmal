import { ChevronDown } from "lucide-react";

/** Stacked rounded question cards (ceynk.lk style), native <details> so it works without JS. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details key={f.q} className="group rounded-[24px] bg-surface px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[17px] font-medium text-ink">
            {f.q}
            <ChevronDown className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden />
          </summary>
          <p className="pb-6 text-[15px] leading-7 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
