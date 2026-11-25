"use client";
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { CopyButton, Spinner, useAction } from "./ui";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { PhoneHint } from "@/components/ui/PhoneHint";
import { issueQuoteAction, reviewPaymentAction, setStatusAction, updateOrderAction } from "@/app/admin/actions";
import { buildMessage, STATUS_MESSAGES, waLink } from "@/lib/whatsapp";
import { STATUS_INFO } from "@/lib/status";
import { formatDate, formatDateTime, formatPhone, lkr } from "@/lib/format";
import { ORDER_STATUSES, type DeliveryFee, type Order, type OrderStatus, type Payment, type Quote } from "@/lib/types";

export function CustomerPanel({ order, districts }: { order: Order; districts: DeliveryFee[] }) {
  const a = useAction();
  const [v, setV] = useState({
    customer_name: order.customer_name,
    customer_phone: order.customer_phone ? formatPhone(order.customer_phone) : "",
    internal_notes: order.internal_notes,
    fulfilment: order.fulfilment,
    district: order.district,
    delivery_address: order.delivery_address,
  });
  return (
    <form
      className="card space-y-3 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(() => updateOrderAction({ code: order.code, ...v }));
      }}
    >
      <h2 className="font-semibold text-green-900">Customer</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="label">Name</span>
          <input className="input" value={v.customer_name} onChange={(e) => setV({ ...v, customer_name: e.target.value })} />
        </label>
        <label className="text-sm">
          <span className="label">WhatsApp</span>
          <input className="input" type="tel" inputMode="tel" value={v.customer_phone} onChange={(e) => setV({ ...v, customer_phone: e.target.value })} placeholder="077 123 4567" />
          <PhoneHint value={v.customer_phone} showHint={false} />
        </label>
        <label className="text-sm">
          <span className="label">Fulfilment</span>
          <select className="input" value={v.fulfilment} onChange={(e) => setV({ ...v, fulfilment: e.target.value as Order["fulfilment"] })}>
            <option value="pickup">Studio pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </label>
        {v.fulfilment === "delivery" && (
          <label className="text-sm">
            <span className="label">District</span>
            <select className="input" value={v.district ?? ""} onChange={(e) => setV({ ...v, district: e.target.value || null })}>
              <option value="">Choose…</option>
              {districts.map((d) => (
                <option key={d.district} value={d.district}>
                  {d.district} ({lkr(d.fee)})
                </option>
              ))}
            </select>
          </label>
        )}
        {v.fulfilment === "delivery" && (
          <label className="text-sm sm:col-span-2">
            <span className="label">Delivery address</span>
            <textarea className="input" rows={2} value={v.delivery_address ?? ""} onChange={(e) => setV({ ...v, delivery_address: e.target.value || null })} />
          </label>
        )}
        <label className="text-sm sm:col-span-2">
          <span className="label">Internal notes (never shown to the customer)</span>
          <textarea className="input" rows={3} value={v.internal_notes} onChange={(e) => setV({ ...v, internal_notes: e.target.value })} />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={a.pending}>
          {a.pending && <Spinner />} Save
        </button>
        {order.customer_phone && (
          <a className="btn-wa" href={waLink(`Hi ${order.customer_name || ""}, this is Nool & Mal about *${order.code}*.`, order.customer_phone)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="size-4" /> Reply on WhatsApp
          </a>
        )}
        <a.Feedback />
      </div>
    </form>
  );
}

export function QuotePanel({
  order,
  quote,
  suggested,
  advancePercent,
  validDays,
  districts,
  quoteUrl,
}: {
  order: Order;
  quote: Quote | null;
  suggested: number;
  advancePercent: number;
  validDays: number;
  districts: DeliveryFee[];
  quoteUrl: string;
}) {
  const a = useAction();
  const districtFee = districts.find((d) => d.district === order.district)?.fee ?? 0;
  const [v, setV] = useState({
    amount: quote?.amount ?? suggested,
    advancePercent: quote?.advance_percent ?? advancePercent,
    deliveryFee: quote?.delivery_fee ?? (order.fulfilment === "delivery" ? districtFee : 0),
    validDays,
    note: quote?.note ?? "",
  });
  const total = v.amount + v.deliveryFee;
  const advance = Math.round((total * v.advancePercent) / 100 / 100) * 100;
  const reply = useMemo(
    () =>
      quote
        ? buildMessage("quote", {
            name: order.customer_name,
            code: order.code,
            total: quote.amount + quote.delivery_fee,
            advancePercent: quote.advance_percent,
            advance: quote.advance_amount,
            validUntil: quote.valid_until,
            link: quoteUrl,
          })
        : "",
    [quote, order, quoteUrl],
  );
  const num = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: Number(e.target.value) || 0 });

  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-green-900">Quotation</h2>
        {quote && <span className="badge">{quote.status === "accepted" ? `Accepted ${formatDate(quote.accepted_at)}` : `Issued · valid to ${formatDate(quote.valid_until)}`}</span>}
      </div>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          a.run(() => issueQuoteAction({ code: order.code, ...v, fulfilment: order.fulfilment, district: order.district }));
        }}
      >
        <label className="text-sm">
          <span className="label">Dress amount (LKR)</span>
          <input className="input" type="number" min={0} step={1} value={v.amount} onChange={num("amount")} />
          <span className="mt-1 block text-xs text-muted">Calculated estimate: {lkr(suggested)}</span>
        </label>
        <label className="text-sm">
          <span className="label">Delivery fee (LKR)</span>
          <input className="input" type="number" min={0} step={1} value={v.deliveryFee} onChange={num("deliveryFee")} />
          <span className="mt-1 block text-xs text-muted">{order.fulfilment === "delivery" ? `${order.district ?? "No district"}: ${lkr(districtFee)}` : "Studio pickup"}</span>
        </label>
        <label className="text-sm">
          <span className="label">Advance %</span>
          <input className="input" type="number" min={0} max={100} value={v.advancePercent} onChange={num("advancePercent")} />
        </label>
        <label className="text-sm">
          <span className="label">Valid for (days)</span>
          <input className="input" type="number" min={1} max={90} value={v.validDays} onChange={num("validDays")} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="label">Note to customer (shown on the quote page)</span>
          <textarea className="input" rows={2} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <p className="text-sm">
            Total <b>{lkr(total)}</b> · advance <b>{lkr(advance)}</b>
          </p>
          <button className="btn-primary ml-auto" disabled={a.pending}>
            {a.pending && <Spinner />} {quote ? "Re-issue quote" : "Issue quote"}
          </button>
        </div>
        <div className="sm:col-span-2">
          <a.Feedback />
        </div>
      </form>
      {quote && (
        <div className="rounded-2xl border border-gold/50 bg-gold-50 p-4">
          <p className="text-xs font-medium tracking-wide text-gold-600 uppercase">WhatsApp reply — ready to send</p>
          <pre className="mt-2 font-sans text-sm whitespace-pre-wrap text-ink">{reply}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={reply} label="Copy reply" />
            {order.customer_phone ? (
              <a className="btn-wa" href={waLink(reply, order.customer_phone)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" /> Open in WhatsApp
              </a>
            ) : (
              <span className="self-center text-xs text-muted">Add the customer&apos;s number to open WhatsApp directly.</span>
            )}
            <a className="btn-ghost" href={quoteUrl} target="_blank" rel="noopener noreferrer">
              Quote page <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusPanel({ order, trackUrl }: { order: Order; trackUrl: string }) {
  const a = useAction();
  const [next, setNext] = useState<OrderStatus>(order.status);
  const idx = ORDER_STATUSES.indexOf(order.status);
  const suggestion = ORDER_STATUSES[idx + 1] && !["cancelled", "collected"].includes(ORDER_STATUSES[idx + 1]) ? ORDER_STATUSES[idx + 1] : null;
  const msg = STATUS_MESSAGES[order.status];
  return (
    <div className="card space-y-4 p-5">
      <h2 className="font-semibold text-green-900">Status</h2>
      <div className="flex flex-wrap items-center gap-2">
        {suggestion && order.status !== "cancelled" && (
          <button type="button" className="btn-primary" disabled={a.pending} onClick={() => a.run(() => setStatusAction(order.code, suggestion))}>
            {a.pending && <Spinner />} Move to “{STATUS_INFO[suggestion].label}”
          </button>
        )}
        <select className="input w-auto" value={next} onChange={(e) => setNext(e.target.value as OrderStatus)} aria-label="Set status">
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_INFO[s].label}
            </option>
          ))}
        </select>
        <button type="button" className="btn-secondary" disabled={a.pending || next === order.status} onClick={() => a.run(() => setStatusAction(order.code, next))}>
          Set
        </button>
        <a.Feedback />
      </div>
      {msg && order.customer_phone && (
        <a
          className="btn-wa"
          target="_blank"
          rel="noopener noreferrer"
          href={waLink(buildMessage("status", { name: order.customer_name, code: order.code, status: msg, link: trackUrl }), order.customer_phone)}
        >
          <WhatsAppIcon className="size-4" /> Notify: “{msg}”
        </a>
      )}
      <ol className="space-y-1.5 border-t border-line pt-3 text-xs">
        {[...order.status_history].reverse().map((h, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span className="font-medium text-ink">{STATUS_INFO[h.status]?.label ?? h.status}</span>
            <span className="text-muted">
              {formatDateTime(h.at)}
              {h.by ? ` · ${h.by}` : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PaymentCard({ payment, slipUrl }: { payment: Payment; slipUrl: string }) {
  const a = useAction();
  const [reason, setReason] = useState("");
  return (
    <div className="card flex gap-4 p-4">
      <a href={slipUrl} target="_blank" rel="noopener noreferrer" className="block w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
        <img src={slipUrl} alt={`${payment.type} payment slip`} className="aspect-[3/4] w-full object-cover" />
      </a>
      <div className="min-w-0 flex-1 space-y-2 text-sm">
        <p>
          <b className="capitalize">{payment.type}</b> · {lkr(payment.amount)} · uploaded {formatDateTime(payment.created_at)}
        </p>
        <p>
          Status:{" "}
          <span className={`badge ${payment.status === "approved" ? "bg-green-50 text-green-900" : ""}`}>
            {payment.status}
            {payment.reject_reason ? ` — ${payment.reject_reason}` : ""}
          </span>
        </p>
        {payment.status === "pending" && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-primary" disabled={a.pending} onClick={() => a.run(() => reviewPaymentAction(payment.id, true, ""))}>
              {a.pending && <Spinner />} Approve
            </button>
            <input className="input w-48" placeholder="Reason if rejecting" value={reason} onChange={(e) => setReason(e.target.value)} />
            <button type="button" className="btn-secondary" disabled={a.pending} onClick={() => a.run(() => reviewPaymentAction(payment.id, false, reason))}>
              Reject
            </button>
          </div>
        )}
        <a.Feedback />
      </div>
    </div>
  );
}
