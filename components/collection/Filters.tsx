"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export function CollectionFilters({
  categories,
  occasions,
  fabrics,
  prices,
}: {
  categories: FilterOption[];
  occasions: FilterOption[];
  fabrics: FilterOption[];
  prices: FilterOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) set("q", q.trim() || null);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = ["category", "occasion", "fabric", "price", "q"].filter((k) => params.get(k));

  const Group = ({ name, label, options }: { name: string; label: string; options: FilterOption[] }) => (
    <fieldset>
      <legend className="eyebrow mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`chip ${!params.get(name) ? "chip-active" : ""}`} aria-pressed={!params.get(name)} onClick={() => set(name, null)}>
          All
        </button>
        {options.map((o) => {
          const on = params.get(name) === o.value;
          return (
            <button key={o.value} type="button" className={`chip ${on ? "chip-active" : ""}`} aria-pressed={on} onClick={() => set(name, on ? null : o.value)}>
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <div className="space-y-4" aria-busy={pending}>
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search designs</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input className="input rounded-full pl-10" type="search" placeholder="Search designs, e.g. lehenga, crochet, satin" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button type="button" className="btn-secondary px-4 lg:hidden" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <SlidersHorizontal className="size-4" aria-hidden /> Filters{active.length ? ` (${active.length})` : ""}
        </button>
      </div>
      <div className={`card space-y-5 p-5 ${open ? "block" : "hidden"} lg:block`}>
        <Group name="category" label="Category" options={categories} />
        <div className="grid gap-5 md:grid-cols-3">
          <Group name="occasion" label="Occasion" options={occasions} />
          <Group name="price" label="Price" options={prices} />
          <Group name="fabric" label="Fabric" options={fabrics} />
        </div>
        {active.length > 0 && (
          <button type="button" className="btn-ghost -ml-3 text-sm" onClick={() => start(() => router.replace(pathname, { scroll: false }))}>
            <X className="size-4" aria-hidden /> Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
