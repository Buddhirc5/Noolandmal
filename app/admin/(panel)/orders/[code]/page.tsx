/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/server/db";
import { signedUrl } from "@/lib/server/storage";
import { getDesignBundleById, loadCatalog } from "@/lib/server/catalog";
import { currentQuote, getOrder, orderBooking } from "@/lib/server/orders";
import { CustomerPanel, PaymentCard, StatusPanel } from "@/components/admin/OrderPanels";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Image from "next/image";
import { Breakdown } from "@/components/customiser/Breakdown";
import { colorHex, colorName } from "@/lib/colors";
import { formatDate, formatDateTime } from "@/lib/format";
import { normalizeCode } from "@/lib/codes";
import { site } from "@/config/site";
import type { Configuration, CustomRequest, EventRow, Payment, RequestFile } from "@/lib/types";
import { photosFor } from "@/lib/photos";
import { describeMeasurements } from "@/lib/measurements";
import { ProgressPanel } from "@/components/admin/ProgressPanel";
import { MeasurementsPanel } from "@/components/admin/MeasurementsPanel";
import { getMeasurements, lkDate } from "@/lib/server/studio";
import { listDocuments, suggestedLines } from "@/lib/server/documents";
import { creditFor, promoForOrder } from "@/lib/server/promos";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { lkr } from "@/lib/format";

export default async function OrderDetail({ params }: PageProps<"/admin/orders/[code]">) {
  const code = normalizeCode((await params).code);
  const order = await getOrder(code);
  if (!order) notFound();
  const catalog = await loadCatalog();
  const [config, request, quote, payments, booking, events] = await Promise.all([
    order.configuration_id ? db.get<Configuration>("configurations", { id: order.configuration_id }) : null,
    order.custom_request_id ? db.get<CustomRequest>("custom_requests", { id: order.custom_request_id }) : null,
    currentQuote(order.id),
    db.list<Payment>("payments", { eq: { order_id: order.id }, order: { column: "created_at", ascending: false } }),
    orderBooking(order.id),
    db.list<EventRow>("events", { eq: { code: order.code }, order: { column: "created_at", ascending: false }, limit: 30 }),
  ]);
  const bundle = config ? await getDesignBundleById(config.design_id) : null;
  const saved = await getMeasurements(order.customer_phone);
  const today = lkDate(new Date());
  const docs = await listDocuments({ orderId: order.id });
  const colourName = config && bundle ? bundle.regions.map((r) => colorName(config.selections.colors[r.key], catalog.palette)).join(" / ") : "";
  const designLabel = bundle ? [bundle.design.name, bundle.design.versions.find((v) => v.key === config?.selections.version)?.name, colourName].filter(Boolean).join(" — ") : null;
  const lastQuote = docs.find((d) => d.kind === "quote");
  const promo = await promoForOrder(order);
  const credit = order.customer_phone ? (await creditFor(order.customer_phone)).available : 0;
  const lines = lastQuote ? lastQuote.items : await suggestedLines(order, designLabel, config?.price_total ?? 0);
  const customerSent = config?.selections.size === "own" ? describeMeasurements(config.selections, catalog) : null;
  const files = request ? await db.list<RequestFile>("request_files", { eq: { custom_request_id: request.id } }) : [];
  const fileUrls = await Promise.all(files.map((f) => signedUrl("references", f.path, 900)));
  const slipUrls = await Promise.all(payments.map((p) => (p.slip_path ? signedUrl("slips", p.slip_path, 900) : Promise.resolve(""))));
  const quoteUrl = `${site.url}/q/${order.code}?k=${order.access_key}`;

  const cover = bundle && config ? photosFor(bundle, { version: config.selections.version ?? null, colors: config.selections.colors }).images[0] : undefined;
  const versionName = bundle && config?.selections.version ? bundle.design.versions.find((v) => v.key === config.selections.version)?.name : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/requests" className="w-full text-sm text-muted hover:text-green-900 md:w-auto">
          ← Orders
        </Link>
        <h1 className="font-mono text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">{order.code}</h1>
        <StatusBadge status={order.status} />
        {order.promo_code && (
          <span className="badge bg-rose-50 text-orchid">
            {order.promo_kind === "referral" ? "Referral" : "Code"} {order.promo_code} · {order.promo_label}
          </span>
        )}
        {order.whatsapp_clicked_at && <span className="badge bg-green-50 text-green-900">WhatsApp opened {formatDateTime(order.whatsapp_clicked_at)}</span>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0 space-y-6">
          {config && bundle && (
            <section className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-ink">{bundle.design.name}{versionName ? ` — ${versionName}` : ""}</h2>
                <Link href={`/d/${config.code}`} target="_blank" className="text-sm text-green-700">
                  Open configuration ↗
                </Link>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-[160px_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-surface-2">
                  {cover && <Image src={cover} alt="" fill sizes="160px" className="object-cover" />}
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                  {bundle.regions.map((r) => (
                    <div key={r.key} className="contents">
                      <dt className="text-muted">{r.label}</dt>
                      <dd className="flex items-center gap-1.5">
                        <span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: colorHex(config.selections.colors[r.key], catalog.palette) }} />
                        {colorName(config.selections.colors[r.key], catalog.palette)}
                      </dd>
                    </div>
                  ))}
                  <dt className="text-muted">Fabric</dt>
                  <dd>{catalog.fabrics.find((f) => f.key === config.selections.fabric)?.name ?? config.selections.fabric}</dd>
                  <dt className="text-muted">Options</dt>
                  <dd>{config.selections.options.filter((k) => !k.endsWith("-design")).map((k) => catalog.options.find((o) => o.key === k)?.name ?? k).join(", ") || "—"}</dd>
                  <dt className="text-muted">Measurements</dt>
                  <dd>{describeMeasurements(config.selections, catalog)}</dd>
                  <dt className="text-muted">Qty</dt>
                  <dd>{config.selections.qty}</dd>
                  <dt className="text-muted">Needed by</dt>
                  <dd>{config.needed_by ? formatDate(config.needed_by) : "Flexible"}</dd>
                  <dt className="text-muted">Notes</dt>
                  <dd className="whitespace-pre-wrap">{config.notes || "—"}</dd>
                </dl>
              </div>
              <div className="mt-4 rounded-2xl bg-ivory p-4">
                <Breakdown price={config.price_breakdown} />
              </div>
            </section>
          )}

          {order.kind === "manual" && (
            <section className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-ink">{order.title || "Studio order"}</h2>
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">Added by studio</span>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-muted">Needed by</dt>
                <dd>{order.needed_by ? formatDate(order.needed_by) : "Flexible"}</dd>
                <dt className="text-muted">Details</dt>
                <dd className="whitespace-pre-wrap">{order.details || "—"}</dd>
              </dl>
            </section>
          )}

          {request && (
            <section className="card space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-green-900">Custom request</h2>
                <Link href={`/r/${order.code}`} target="_blank" className="text-sm text-green-700">
                  Request page ↗
                </Link>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-muted">Occasion</dt>
                <dd>{request.occasion}</dd>
                <dt className="text-muted">Needed by</dt>
                <dd>{request.needed_by ? formatDate(request.needed_by) : "Flexible"}</dd>
                <dt className="text-muted">Budget</dt>
                <dd>{request.budget || "Not set"}</dd>
                <dt className="text-muted">Link</dt>
                <dd className="break-all">
                  {request.reference_url ? (
                    <a href={request.reference_url} target="_blank" rel="noopener noreferrer nofollow" className="text-green-700 underline">
                      {request.reference_url}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
                <dt className="text-muted">Notes</dt>
                <dd className="whitespace-pre-wrap">{request.notes || "—"}</dd>
                <dt className="text-muted">Size notes</dt>
                <dd>{request.size_notes || "—"}</dd>
              </dl>
              {fileUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {fileUrls.map((u, i) => (
                    <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl border border-line">
                      <img src={u} alt={`Reference ${i + 1}`} className="aspect-square w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}

          <section id="documents" className="card scroll-mt-20 space-y-5 p-5">
            <div>
              <h2 className="font-semibold text-green-900">Quotations &amp; invoices</h2>
              <p className="mt-0.5 text-sm text-muted">Saved and numbered. Share the PDF straight to the customer on WhatsApp.</p>
            </div>
            {docs.length > 0 && (
              <ul className="space-y-3">
                {docs.map((d) => (
                  <li key={d.id} className="rounded-[18px] bg-surface p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-semibold text-ink">
                        {d.kind === "quote" ? "Quotation" : "Invoice"} {d.number}
                      </p>
                      <p className="font-semibold tabular-nums">{lkr(d.total)}</p>
                    </div>
                    <p className="mb-3 text-xs text-muted">Issued {formatDate(d.issued_on)}</p>
                    <DocumentActions id={d.id} number={d.number} kind={d.kind} compact canDelete />
                  </li>
                ))}
              </ul>
            )}
            <DocumentForm
              orderCode={order.code}
              phone={order.customer_phone}
              name={order.customer_name}
              lines={lines}
              advancePercent={catalog.settings.advance_percent}
              validDays={catalog.settings.quote_valid_days}
              deliveryFee={lastQuote?.delivery_fee ?? quote?.delivery_fee ?? 0}
              discount={lastQuote?.discount ?? 0}
              promo={promo && promo.ok ? { code: promo.code, label: promo.label, type: promo.type, value: promo.value, minTotal: promo.minTotal } : null}
              credit={credit}
              defaultKind={quote ? "invoice" : "quote"}
              today={today}
            />
          </section>

          {payments.some((p) => p.method !== "whatsapp") && (
            <section className="space-y-3">
              <h2 className="font-semibold text-green-900">Slips uploaded by the customer</h2>
              {payments.map((p, i) => (p.method !== "whatsapp" ? <PaymentCard key={p.id} payment={p} slipUrl={slipUrls[i]} /> : null))}
            </section>
          )}

          <MeasurementsPanel phone={order.customer_phone} name={order.customer_name} saved={saved} customerSent={customerSent} today={today} />
        </div>

        <div className="order-first min-w-0 space-y-6 xl:order-none">
          <ProgressPanel key={`${quote?.id ?? "none"}-${payments.length}`} order={order} quote={quote} payments={payments} today={today} />
          <CustomerPanel order={order} districts={catalog.settings.delivery_fees} />
          <StatusPanel order={order} trackUrl={quoteUrl} />
          <section className="card p-5 text-sm">
            <h2 className="font-semibold text-green-900">Measurement</h2>
            {booking?.slot ? (
              <p className="mt-2">
                {formatDateTime(booking.slot.starts_at)} · {booking.booking.mode === "home" ? `Home visit: ${booking.booking.address}` : "Studio"}
              </p>
            ) : (
              <p className="mt-2 text-muted">Not booked yet.</p>
            )}
          </section>
          <section className="card p-5 text-sm">
            <h2 className="font-semibold text-green-900">Timeline</h2>
            <ol className="mt-3 space-y-1.5 text-xs">
              {events.map((e) => (
                <li key={e.id} className="flex justify-between gap-3">
                  <span>{e.type.replace(/_/g, " ")}</span>
                  <span className="text-muted">{formatDateTime(e.created_at)}</span>
                </li>
              ))}
              {!events.length && <li className="text-muted">No events.</li>}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
