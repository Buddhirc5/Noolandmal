import Link from "next/link";
import { notFound } from "next/navigation";
import { listOrderRows } from "@/lib/server/admin-data";
import { getMeasurements, lkDate } from "@/lib/server/studio";
import { getCustomer, lookupCustomer } from "@/lib/server/customers";
import { listDocuments } from "@/lib/server/documents";
import { db } from "@/lib/server/db";
import { loadSettings } from "@/lib/server/catalog";
import { MeasurementsPanel } from "@/components/admin/MeasurementsPanel";
import { CustomerEditor } from "@/components/admin/CustomerEditor";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { OrderTable } from "@/components/admin/OrderTable";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";
import { formatDate, formatPhone, lkr } from "@/lib/format";
import type { Payment } from "@/lib/types";

export const metadata = { title: "Customer" };

export default async function Customer({ params }: PageProps<"/admin/customers/[phone]">) {
  const phone = (await params).phone.replace(/\D/g, "");
  if (phone.length < 9) notFound();
  const [rows, saved, customer, info, docs, settings] = await Promise.all([listOrderRows(), getMeasurements(phone), getCustomer(phone), lookupCustomer(phone), listDocuments({ phone }), loadSettings()]);
  const mine = rows.filter((r) => r.order.customer_phone === phone);
  const name = customer?.name || (info.valid ? info.name : "");
  const payments = mine.length ? await db.list<Payment>("payments", { in: { column: "order_id", values: mine.map((r) => r.order.id) } }) : [];
  const paid = payments.filter((p) => p.status === "approved").reduce((a, p) => a + p.amount, 0);
  const today = lkDate(new Date());
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-muted hover:text-green-900">
          ← Customers
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">{name || "New customer"}</h1>
        <p className="mt-1 text-[15px] text-muted tabular-nums">{formatPhone(phone)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["Orders", String(mine.length)],
            ["Paid", lkr(paid)],
            ["Measured", saved && Object.keys(saved.values).length ? formatDate(saved.taken_on ?? saved.updated_at, { day: "numeric", month: "short" }) : "No"],
          ].map(([l, v]) => (
            <div key={l} className="card px-2 py-3">
              <p className="truncate text-[15px] font-semibold text-ink tabular-nums">{v}</p>
              <p className="text-[11px] text-muted">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a className="btn-wa h-12" href={waLink(`Hi ${name.split(" ")[0] || ""}, this is Nool & Mal. `, phone)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="size-4" /> WhatsApp
          </a>
          <Link href={`/admin/orders/new?phone=${phone}`} className="btn-primary h-12">
            New order
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <section>
            <h2 className="mb-3 font-semibold text-green-900">Orders</h2>
            <OrderTable rows={mine} empty="No orders yet for this number." />
          </section>
          <section className="space-y-3">
            <h2 className="font-semibold text-green-900">Quotations &amp; invoices</h2>
            {docs.length ? (
              docs.map((d) => (
                <div key={d.id} className="card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold">
                      {d.kind === "quote" ? "Quotation" : "Invoice"} {d.number}
                    </p>
                    <p className="font-semibold tabular-nums">{lkr(d.total)}</p>
                  </div>
                  <p className="mb-3 text-xs text-muted">
                    {formatDate(d.issued_on)}
                    {d.order_code ? ` · ${d.order_code}` : ""}
                  </p>
                  <DocumentActions id={d.id} number={d.number} kind={d.kind} compact />
                </div>
              ))
            ) : (
              <p className="card p-5 text-sm text-muted">None yet.</p>
            )}
            <details className="card p-5">
              <summary className="cursor-pointer font-medium text-ink">Quick quotation or invoice (no order)</summary>
              <div className="mt-4">
                <DocumentForm orderCode={null} phone={phone} name={name} lines={[]} advancePercent={settings.advance_percent} validDays={settings.quote_valid_days} today={today} />
              </div>
            </details>
          </section>
        </div>
        <div className="order-first min-w-0 space-y-6 xl:order-none">
          <CustomerEditor phone={phone} name={name} notes={customer?.notes ?? ""} />
          <MeasurementsPanel phone={phone} name={name} saved={saved} today={today} />
        </div>
      </div>
    </div>
  );
}
