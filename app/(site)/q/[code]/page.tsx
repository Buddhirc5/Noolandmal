import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";
import { db } from "@/lib/server/db";
import { availableSlots, canAccess, currentQuote, getOrder, orderBooking, weekKey } from "@/lib/server/orders";
import { getAdmin, getGuestId, getUser } from "@/lib/server/auth";
import { getDesignBundleById, loadSettings } from "@/lib/server/catalog";
import { AcceptQuote, BookingPicker, SlipUpload, type SlotOption } from "@/components/order/OrderActions";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { isValidCode, normalizeCode } from "@/lib/codes";
import { formatDate, formatDateTime, lkr, toISODate } from "@/lib/format";
import { STATUS_INFO, TIMELINE, timelineIndex } from "@/lib/status";
import { waLink } from "@/lib/whatsapp";
import type { Configuration, Payment } from "@/lib/types";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

export default async function QuotePage({ params, searchParams }: PageProps<"/q/[code]">) {
  const code = normalizeCode((await params).code);
  const kParam = (await searchParams).k;
  if (!isValidCode(code)) notFound();
  const order = await getOrder(code);
  if (!order) notFound();
  const [guestId, user, admin] = await Promise.all([getGuestId(), getUser(), getAdmin()]);
  const k = typeof kParam === "string" ? kParam : null;
  if (!canAccess(order, { key: k, guestId, userId: user?.id, admin })) redirect(`/track?code=${code}`);
  const key = order.access_key; // the viewer is authorised; reuse the key for API calls

  const [quote, payments, booking, settings, slots] = await Promise.all([
    currentQuote(order.id),
    db.list<Payment>("payments", { eq: { order_id: order.id }, order: { column: "created_at", ascending: false } }),
    orderBooking(order.id),
    loadSettings(),
    availableSlots(),
  ]);
  const config = order.configuration_id ? await db.get<Configuration>("configurations", { id: order.configuration_id }) : null;
  const design = config ? (await getDesignBundleById(config.design_id))?.design : null;

  const ti = timelineIndex(order.status);
  const total = quote ? quote.amount + quote.delivery_fee : 0;
  const expired = quote && quote.status === "issued" && quote.valid_until < toISODate(new Date());
  const advancePaid = payments.some((p) => p.type === "advance" && p.status === "approved");
  const advancePending = payments.some((p) => p.type === "advance" && p.status === "pending");
  const finalPaid = payments.some((p) => p.type === "final" && p.status === "approved") || order.paid_in_full;
  const finalPending = payments.some((p) => p.type === "final" && p.status === "pending");
  const canBook = ["advance_paid", "measurement_booked"].includes(order.status);
  const finalStage = ["fitting", "ready"].includes(order.status);

  const slotOptions: SlotOption[] = slots.map((s) => {
    const d = new Date(s.starts_at);
    const wk = weekKey(d);
    return {
      id: s.id,
      starts_at: s.starts_at,
      mode: s.mode,
      remaining: s.remaining,
      weekFull: s.weekFull,
      week: wk,
      weekLabel: formatDate(wk, { day: "numeric", month: "short" }),
      label: d.toLocaleString("en-GB", { timeZone: "Asia/Colombo", weekday: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    };
  });

  const wa = waLink(`Hi Nool & Mal, about my order *${order.code}*: `);

  return (
    <div className="container-x max-w-4xl py-10 md:py-14">
      <p className="eyebrow">{order.kind === "custom" ? "Custom request" : "Your design"}</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="h-display text-5xl">{order.code}</h1>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-wa">
          <WhatsAppIcon className="size-4" /> Message us
        </a>
      </div>
      {design && (
        <p className="mt-2 text-sm text-muted">
          {design.name} ·{" "}
          <Link href={`/d/${order.code}`} className="text-green-700 underline">
            view design
          </Link>
        </p>
      )}

      {/* Timeline */}
      <section className="card mt-8 p-5" aria-label="Order progress">
        <p className="text-sm">
          <b className="font-semibold text-green-900">{STATUS_INFO[order.status].label}.</b> <span className="text-muted">{STATUS_INFO[order.status].hint}</span>
        </p>
        {order.status !== "cancelled" && (
          <ol className="mt-5 grid grid-cols-5 gap-y-4 sm:grid-cols-10">
            {TIMELINE.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-1.5 text-center" aria-current={i === ti ? "step" : undefined}>
                <span className={`flex size-7 items-center justify-center rounded-full text-xs ${i < ti ? "bg-green-900 text-white" : i === ti ? "bg-gold text-green-900 ring-4 ring-gold/25" : "border border-line bg-paper text-muted"}`}>
                  {i < ti ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                <span className={`text-[10px] leading-tight ${i <= ti ? "text-ink" : "text-muted"}`}>{s === "delivered" ? "Delivered / collected" : STATUS_INFO[s].label}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Quote */}
      <section className="card mt-6 p-5 sm:p-7">
        <h2 className="text-3xl font-semibold tracking-tight text-green-900">Quotation</h2>
        {!quote ? (
          <p className="mt-3 text-[15px] leading-7 text-muted">
            We&apos;re preparing your quotation and will send it on WhatsApp — usually within a day.
            {config && (
              <>
                {" "}
                Your online estimate was <b className="text-ink">{lkr(config.price_min)} – {lkr(config.price_max)}</b>.
              </>
            )}
          </p>
        ) : (
          <>
            <dl className="mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-muted">Dress</dt>
                <dd className="tabular-nums">{lkr(quote.amount)}</dd>
              </div>
              {quote.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery{order.district ? ` (${order.district})` : ""}</dt>
                  <dd className="tabular-nums">{lkr(quote.delivery_fee)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 text-lg font-semibold text-green-900">
                <dt>Total</dt>
                <dd className="tabular-nums">{lkr(total)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted">Advance ({quote.advance_percent}%) to confirm</dt>
                <dd className="tabular-nums font-medium">{lkr(quote.advance_amount)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted">Balance before {order.fulfilment === "delivery" ? "delivery" : "collection"}</dt>
                <dd className="tabular-nums">{lkr(total - quote.advance_amount)}</dd>
              </div>
            </dl>
            {quote.note && <p className="mt-4 rounded-xl bg-ivory p-3 text-sm whitespace-pre-wrap">{quote.note}</p>}
            <p className="mt-4 text-sm text-muted">{quote.status === "accepted" ? `Accepted on ${formatDate(quote.accepted_at)}.` : expired ? `This quote expired on ${formatDate(quote.valid_until)}. Message us for an updated one.` : `Valid until ${formatDate(quote.valid_until)}.`}</p>
            {quote.status === "issued" && !expired && (
              <div className="mt-5">
                <AcceptQuote code={order.code} k={key} />
              </div>
            )}
          </>
        )}
      </section>

      {/* Payment */}
      {quote?.status === "accepted" && (
        <section className="card mt-6 space-y-5 p-5 sm:p-7">
          <h2 className="text-3xl font-semibold tracking-tight text-green-900">Payment</h2>
          <div className="rounded-2xl border border-gold/50 bg-gold-50 p-4 text-sm">
            <p className="font-medium text-green-900">Bank transfer</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-muted">Account name</dt>
              <dd>{settings.bank.accountName}</dd>
              <dt className="text-muted">Bank / branch</dt>
              <dd>
                {settings.bank.bank} · {settings.bank.branch}
              </dd>
              <dt className="text-muted">Account no.</dt>
              <dd className="font-mono">{settings.bank.accountNumber}</dd>
              <dt className="text-muted">Reference</dt>
              <dd>
                <b>{order.code}</b> (please use your code)
              </dd>
            </dl>
          </div>
          {!advancePaid ? (
            advancePending ? (
              <p className="text-sm text-muted">Your advance slip is being checked. We&apos;ll confirm on WhatsApp.</p>
            ) : (
              <SlipUpload code={order.code} k={key} type="advance" amountLabel={lkr(quote.advance_amount)} />
            )
          ) : (
            <p className="flex items-center gap-2 text-sm text-success">
              <Check className="size-4" aria-hidden /> Advance received.
            </p>
          )}
          {advancePaid && finalStage && !finalPaid && (finalPending ? <p className="text-sm text-muted">Your balance slip is being checked.</p> : <SlipUpload code={order.code} k={key} type="final" amountLabel={lkr(total - quote.advance_amount)} />)}
          {finalPaid && (
            <p className="flex items-center gap-2 text-sm text-success">
              <Check className="size-4" aria-hidden /> Paid in full. Thank you!
            </p>
          )}
          {payments.some((p) => p.status === "rejected") && (
            <ul className="space-y-1 text-sm">
              {payments
                .filter((p) => p.status === "rejected")
                .map((p) => (
                  <li key={p.id} className="text-danger">
                    A {p.type} slip from {formatDateTime(p.created_at)} couldn&apos;t be verified: {p.reject_reason}. Please upload it again.
                  </li>
                ))}
            </ul>
          )}
        </section>
      )}

      {/* Measurement */}
      {(canBook || booking) && (
        <section className="card mt-6 p-5 sm:p-7">
          <h2 className="text-3xl font-semibold tracking-tight text-green-900">Measurement appointment</h2>
          <div className="mt-4">
            {canBook ? (
              <BookingPicker code={order.code} k={key} slots={slotOptions} current={booking?.slot ? `${formatDateTime(booking.slot.starts_at)} (${booking.booking.mode === "home" ? "home visit" : "studio"})` : null} />
            ) : (
              booking?.slot && <p className="text-sm">Appointment: {formatDateTime(booking.slot.starts_at)}</p>
            )}
          </div>
        </section>
      )}
      <p className="mt-8 text-center text-xs text-muted">Keep this page private — it shows your order details. Lost the link? Use your code and phone number at /track.</p>
    </div>
  );
}
