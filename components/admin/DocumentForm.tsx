"use client";
import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Spinner, useAction } from "./ui";
import { DocumentActions } from "./DocumentActions";
import { createDocumentAction } from "@/app/admin/customer-actions";
import { lkr, cn } from "@/lib/format";
import type { DocLine } from "@/lib/types";

interface Props {
  orderCode: string | null;
  phone: string;
  name: string;
  lines: DocLine[];
  advancePercent: number;
  validDays: number;
  deliveryFee?: number;
  discount?: number;
  defaultKind?: "quote" | "invoice";
  today: string;
}

const addDays = (iso: string, d: number) => {
  const x = new Date(`${iso}T00:00:00`);
  x.setDate(x.getDate() + d);
  return x.toLocaleDateString("en-CA");
};

/** Builds a quotation or invoice; saving numbers it and makes the PDF ready to share. */
export function DocumentForm({ orderCode, phone, name, lines, advancePercent, validDays, deliveryFee = 0, discount: initialDiscount = 0, defaultKind = "quote", today }: Props) {
  const a = useAction();
  const [kind, setKind] = useState<"quote" | "invoice">(defaultKind);
  const [items, setItems] = useState<DocLine[]>(lines.length ? lines : [{ description: "", qty: 1, unit_price: 0 }]);
  const [discount, setDiscount] = useState(initialDiscount);
  const [delivery, setDelivery] = useState(deliveryFee);
  const [adv, setAdv] = useState(advancePercent);
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState(addDays(today, defaultKind === "quote" ? validDays : 0));
  const [made, setMade] = useState<{ id: string; number: string; kind: "quote" | "invoice" } | null>(null);

  const subtotal = items.reduce((s, l) => s + l.qty * l.unit_price, 0);
  const total = Math.max(0, subtotal - discount + delivery);
  const advance = Math.round((total * adv) / 100 / 100) * 100;
  const set = (i: number, patch: Partial<DocLine>) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const num = (v: string) => Math.max(0, Math.round(Number(v) || 0));

  if (made)
    return (
      <div className="space-y-4">
        <div className="rounded-[20px] bg-ink p-5 text-white">
          <p className="text-[13px] text-white/60">{made.kind === "quote" ? "Quotation" : "Invoice"} saved</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{made.number}</p>
          <p className="mt-1 text-sm text-white/70">
            {lkr(total)} · {name || "customer"}
          </p>
        </div>
        <DocumentActions id={made.id} number={made.number} kind={made.kind} />
        <button type="button" className="text-sm text-muted underline underline-offset-4" onClick={() => setMade(null)}>
          Make another
        </button>
      </div>
    );

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(
          () => createDocumentAction({ kind, orderCode, phone, name, items, discount, deliveryFee: delivery, advancePercent: kind === "quote" ? adv : 0, notes, dueOn: due || null }),
          (r) => setMade({ ...(r.data as { id: string; number: string }), kind }),
        );
      }}
    >
      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1" role="radiogroup" aria-label="Document type">
        {(["quote", "invoice"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => (setKind(k), setDue(addDays(today, k === "quote" ? validDays : 0)))}
            className={cn("h-11 rounded-full text-[15px] font-medium transition-colors", kind === k ? "bg-ink text-white" : "text-ink")}
          >
            {k === "quote" ? "Quotation" : "Invoice"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((l, i) => (
          <div key={i} className="rounded-[18px] bg-surface p-3">
            <div className="flex gap-2">
              <label className="sr-only" htmlFor={`d-${i}`}>Item {i + 1}</label>
              <input id={`d-${i}`} className="input h-12 flex-1 border-0 bg-paper" placeholder="e.g. Pearl organza midi dress, lilac" value={l.description} onChange={(e) => set(i, { description: e.target.value })} />
              {items.length > 1 && (
                <button type="button" className="flex size-12 shrink-0 items-center justify-center rounded-full text-muted" aria-label="Remove item" onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))}>
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center rounded-full bg-paper" role="group" aria-label="Quantity">
                <button type="button" className="flex size-11 items-center justify-center" aria-label="Less" onClick={() => set(i, { qty: Math.max(1, l.qty - 1) })}>
                  <Minus className="size-4" aria-hidden />
                </button>
                <span className="w-6 text-center tabular-nums">{l.qty}</span>
                <button type="button" className="flex size-11 items-center justify-center" aria-label="More" onClick={() => set(i, { qty: l.qty + 1 })}>
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>
              <label className="relative flex-1">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted">LKR</span>
                <input className="input h-11 border-0 bg-paper pl-12 text-right tabular-nums" type="number" inputMode="numeric" min={0} value={l.unit_price || ""} aria-label="Price each" onChange={(e) => set(i, { unit_price: num(e.target.value) })} />
              </label>
            </div>
          </div>
        ))}
        <button type="button" className="btn-secondary h-11 w-full" onClick={() => setItems((xs) => [...xs, { description: "", qty: 1, unit_price: 0 }])}>
          <Plus className="size-4" aria-hidden /> Add item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="label">Discount</span>
          <input className="input h-12 tabular-nums" type="number" inputMode="numeric" min={0} value={discount || ""} onChange={(e) => setDiscount(num(e.target.value))} />
        </label>
        <label className="text-sm">
          <span className="label">Delivery</span>
          <input className="input h-12 tabular-nums" type="number" inputMode="numeric" min={0} value={delivery || ""} onChange={(e) => setDelivery(num(e.target.value))} />
        </label>
        {kind === "quote" && (
          <label className="text-sm">
            <span className="label">Advance %</span>
            <input className="input h-12 tabular-nums" type="number" inputMode="numeric" min={0} max={100} value={adv} onChange={(e) => setAdv(Math.min(100, num(e.target.value)))} />
          </label>
        )}
        <label className={cn("text-sm", kind === "invoice" && "col-span-2")}>
          <span className="label">{kind === "quote" ? "Valid until" : "Due by"}</span>
          <input className="input h-12" type="date" min={today} value={due} onChange={(e) => setDue(e.target.value)} />
        </label>
      </div>
      <label className="block text-sm">
        <span className="label">Note on the document <span className="font-normal text-muted">(optional)</span></span>
        <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Fabric: lilac organza. Fitting on 12 Dec." />
      </label>

      <div className="rounded-[20px] bg-surface p-4 text-[15px]">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span className="tabular-nums">{lkr(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="mt-1 flex justify-between text-muted">
            <span>Discount</span>
            <span className="tabular-nums">– {lkr(discount)}</span>
          </div>
        )}
        {delivery > 0 && (
          <div className="mt-1 flex justify-between text-muted">
            <span>Delivery</span>
            <span className="tabular-nums">{lkr(delivery)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-line pt-2 text-lg font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{lkr(total)}</span>
        </div>
        {kind === "quote" && adv > 0 && <p className="mt-1 text-right text-sm text-muted">Advance {lkr(advance)}</p>}
      </div>

      <button className="btn-primary h-14 w-full text-[16px]" disabled={a.pending || !subtotal}>
        {a.pending && <Spinner />} Save {kind === "quote" ? "quotation" : "invoice"} & make PDF
      </button>
      {!phone && <p className="text-sm text-danger">Add the customer&apos;s WhatsApp number first — it&apos;s their ID.</p>}
      <a.Feedback />
    </form>
  );
}
