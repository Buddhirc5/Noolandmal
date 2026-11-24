import { Plus } from "lucide-react";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-paper">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-left font-medium text-green-900">
            {f.q}
            <Plus className="size-5 shrink-0 text-gold-600 transition-transform duration-200 group-open:rotate-45" aria-hidden />
          </summary>
          <p className="pb-5 text-[15px] leading-7 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
