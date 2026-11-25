"use client";
import { useState } from "react";
import { Spinner, useAction } from "./ui";
import { saveDiscountCodeAction } from "@/app/admin/customer-actions";
import { cn } from "@/lib/format";
import type { DiscountCode } from "@/lib/types";

type Editable = Omit<DiscountCode, "created_at" | "id"> & { id: string | null };
const blank: Editable = { id: null, code: "", kind: "percent", value: 10, min_total: 0, starts_on: null, ends_on: null, max_uses: null, active: true, note: "" };

export function DiscountCodeForm({ initial, onDone }: { initial?: DiscountCode; onDone?: () => void }) {
  const a = useAction();
  const [v, setV] = useState<Editable>(initial ? { ...initial } : blank);
  const n = (x: string) => Math.max(0, Math.round(Number(x) || 0));
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(() => saveDiscountCodeAction(v), () => {
          if (!initial) setV(blank);
          onDone?.();
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 text-sm">
          <span className="label">Code</span>
          <input className="input h-12 font-mono uppercase" autoCapitalize="characters" maxLength={20} value={v.code} onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase().replace(/\s/g, "") })} placeholder="HOMECOMING10" required />
        </label>
        <div className="col-span-2 grid grid-cols-2 gap-1 rounded-full bg-surface p-1" role="radiogroup" aria-label="Discount type">
          {(["percent", "fixed"] as const).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={v.kind === k} onClick={() => setV({ ...v, kind: k })} className={cn("h-10 rounded-full text-sm font-medium", v.kind === k ? "bg-ink text-white" : "text-ink")}>
              {k === "percent" ? "% off" : "LKR off"}
            </button>
          ))}
        </div>
        <label className="text-sm">
          <span className="label">{v.kind === "percent" ? "Percent off" : "Rupees off"}</span>
          <input className="input h-12 tabular-nums" type="number" inputMode="numeric" min={1} max={v.kind === "percent" ? 90 : undefined} value={v.value || ""} onChange={(e) => setV({ ...v, value: n(e.target.value) })} />
        </label>
        <label className="text-sm">
          <span className="label">Minimum order (LKR)</span>
          <input className="input h-12 tabular-nums" type="number" inputMode="numeric" min={0} value={v.min_total || ""} onChange={(e) => setV({ ...v, min_total: n(e.target.value) })} placeholder="None" />
        </label>
        <label className="text-sm">
          <span className="label">Starts</span>
          <input className="input h-12" type="date" value={v.starts_on ?? ""} onChange={(e) => setV({ ...v, starts_on: e.target.value || null })} />
        </label>
        <label className="text-sm">
          <span className="label">Ends</span>
          <input className="input h-12" type="date" value={v.ends_on ?? ""} onChange={(e) => setV({ ...v, ends_on: e.target.value || null })} />
        </label>
        <label className="text-sm">
          <span className="label">Max uses</span>
          <input className="input h-12 tabular-nums" type="number" inputMode="numeric" min={1} value={v.max_uses ?? ""} onChange={(e) => setV({ ...v, max_uses: e.target.value ? n(e.target.value) : null })} placeholder="Unlimited" />
        </label>
        <label className="flex items-end gap-2 pb-3 text-sm">
          <input type="checkbox" className="size-5 accent-[var(--color-pink)]" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} />
          Active
        </label>
        <label className="col-span-2 text-sm">
          <span className="label">Note (only you see this)</span>
          <input className="input h-12" maxLength={200} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} placeholder="e.g. homecoming season Instagram post" />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary h-12" disabled={a.pending}>
          {a.pending && <Spinner />} {initial ? "Save changes" : "Create code"}
        </button>
        <a.Feedback />
      </div>
    </form>
  );
}
