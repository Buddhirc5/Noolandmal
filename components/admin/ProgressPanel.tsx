"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Spinner, useAction } from "./ui";
import { markReceivedAction, recordPaymentAction, removePaymentAction } from "@/app/admin/studio-actions";
import { setStatusAction } from "@/app/admin/actions";
import { formatDate, formatDateTime, lkr, cn } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus, type Payment, type Quote } from "@/lib/types";

const idx = (s: OrderStatus) => ORDER_STATUSES.indexOf(s);
const MAKING: [OrderStatus, string][] = [
  ["cutting", "Cutting"],
  ["sewing", "Sewing"],
  ["fitting", "Fitting"],
  ["ready", "Ready"],
];

/**
 * The studio's checklist for one order. Everything with the customer happens
 * on WhatsApp; each row here just records that a step is done.
 */
export function ProgressPanel({ order, quote, payments, today }: { order: Order; quote: Quote | null; payments: Payment[]; today: string }) {
  const a = useAction();
  const approved = payments.filter((p) => p.status === "approved");
  const paid = approved.reduce((s, p) => s + p.amount, 0);
  const total = quote ? quote.amount + quote.delivery_fee : 0;
  const advanceDone = approved.some((p) => p.type === "advance");
  const fullDone = order.paid_in_full;
  const received = Boolean(order.received_at) || order.kind === "manual" || idx(order.status) >= idx("quoted");
  const measured = idx(order.status) >= idx("measured") && order.status !== "cancelled";
  const made = idx(order.status) >= idx("ready") && order.status !== "cancelled";
  const handedOver = ["delivered", "collected"].includes(order.status);

  const [adv, setAdv] = useState({ amount: quote?.advance_amount ?? 0, paidOn: today });
  const [bal, setBal] = useState({ amount: Math.max(0, total - paid), paidOn: today });

  const Row = ({ done, title, sub, children }: { done: boolean; title: string; sub?: string; children?: React.ReactNode }) => (
    <li className="flex gap-3 py-3.5">
      <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", done ? "bg-ink text-white" : "border-2 border-ink/20")}>{done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}</span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-medium", done ? "text-ink" : "text-ink/80")}>{title}</p>
        {sub && <p className="text-[13px] text-muted">{sub}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </li>
  );

  const payForm = (v: { amount: number; paidOn: string }, set: (x: { amount: number; paidOn: string }) => void, type: "advance" | "final", label: string) => (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(() => recordPaymentAction({ code: order.code, type, amount: v.amount, paidOn: v.paidOn }));
      }}
    >
      <label className="sr-only" htmlFor={`${type}-amt`}>Amount</label>
      <input id={`${type}-amt`} className="input h-10 w-32" type="number" min={1} value={v.amount || ""} placeholder="LKR" onChange={(e) => set({ ...v, amount: Number(e.target.value) || 0 })} />
      <label className="sr-only" htmlFor={`${type}-date`}>Date received</label>
      <input id={`${type}-date`} className="input h-10 w-40" type="date" max={today} value={v.paidOn} onChange={(e) => set({ ...v, paidOn: e.target.value })} />
      <button className="btn-primary h-10" disabled={a.pending || !v.amount}>
        {a.pending && <Spinner />} {label}
      </button>
    </form>
  );

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-green-900">Progress</h2>
        {total > 0 && (
          <p className="text-sm tabular-nums">
            Paid <b>{lkr(paid)}</b> of {lkr(total)}
            {total - paid > 0 && <span className="text-muted"> · balance {lkr(total - paid)}</span>}
          </p>
        )}
      </div>
      <ol className="mt-2 divide-y divide-line">
        <Row done={received} title="Code received on WhatsApp" sub={order.received_at ? formatDateTime(order.received_at) : order.whatsapp_clicked_at ? "Customer opened WhatsApp — check your messages" : "Not received yet"}>
          {!received && (
            <button type="button" className="btn-secondary h-10" disabled={a.pending} onClick={() => a.run(() => markReceivedAction(order.code))}>
              Mark received
            </button>
          )}
        </Row>
        <Row done={Boolean(quote)} title="Quotation sent" sub={quote ? `${lkr(total)} · ${formatDate(quote.created_at)}` : "Fill in the quotation below, then send it on WhatsApp"} />
        <Row done={advanceDone} title="Advance paid" sub={advanceDone ? approved.filter((p) => p.type === "advance").map((p) => `${lkr(p.amount)} on ${formatDate(p.paid_on ?? p.created_at)}`).join(", ") : "Record it once the money is in your account"}>
          {!advanceDone && payForm(adv, setAdv, "advance", "Advance received")}
        </Row>
        <Row done={measured} title="Measurements taken" sub={measured ? "Saved in the measurements box" : "Save them in the measurements box, then mark done"}>
          {!measured && (
            <button type="button" className="btn-secondary h-10" disabled={a.pending} onClick={() => a.run(() => setStatusAction(order.code, "measured"))}>
              Mark measured
            </button>
          )}
        </Row>
        <Row done={made} title="Making" sub={made ? "Ready" : idx(order.status) >= idx("cutting") ? `Now: ${order.status}` : undefined}>
          {!made && (
            <div className="flex flex-wrap gap-2">
              {MAKING.map(([s, l]) => (
                <button key={s} type="button" disabled={a.pending} onClick={() => a.run(() => setStatusAction(order.code, s))} className={cn("chip h-10", order.status === s && "chip-active")}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </Row>
        <Row done={fullDone} title="Fully paid" sub={fullDone ? `Total received ${lkr(paid)}` : total ? `Balance ${lkr(Math.max(0, total - paid))}` : undefined}>
          {!fullDone && payForm(bal, setBal, "final", "Balance received")}
        </Row>
        <Row done={handedOver} title="Handed over" sub={handedOver ? (order.status === "delivered" ? "Delivered" : "Collected") : undefined}>
          {!handedOver && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary h-10" disabled={a.pending} onClick={() => a.run(() => setStatusAction(order.code, "collected"))}>
                Collected
              </button>
              <button type="button" className="btn-secondary h-10" disabled={a.pending} onClick={() => a.run(() => setStatusAction(order.code, "delivered"))}>
                Delivered
              </button>
            </div>
          )}
        </Row>
      </ol>
      <a.Feedback />
      {approved.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Payments received</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {approved.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <span>
                  {p.type === "advance" ? "Advance" : "Balance"} · <b className="tabular-nums">{lkr(p.amount)}</b> · {formatDate(p.paid_on ?? p.created_at)}
                  <span className="text-muted"> · {p.method === "whatsapp" ? "recorded" : "slip"}</span>
                </span>
                {p.method === "whatsapp" && (
                  <button type="button" className="text-xs text-muted hover:text-danger" disabled={a.pending} onClick={() => confirm("Remove this payment record?") && a.run(() => removePaymentAction(p.id))}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
