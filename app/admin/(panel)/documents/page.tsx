import Link from "next/link";
import { listDocuments, paidForOrder } from "@/lib/server/documents";
import { DocumentActions } from "@/components/admin/DocumentActions";
import { formatDate, lkr, cn } from "@/lib/format";

export const metadata = { title: "Quotes & invoices" };

export default async function Documents({ searchParams }: PageProps<"/admin/documents">) {
  const k = (await searchParams).kind;
  const kind = k === "invoice" || k === "quote" ? k : "";
  let docs = await listDocuments();
  if (kind) docs = docs.filter((d) => d.kind === kind);
  // live payment status for invoices tied to orders
  const paidNow = new Map(await Promise.all(docs.filter((d) => d.kind === "invoice" && d.order_id).map(async (d) => [d.id, await paidForOrder(d.order_id!)] as const)));
  const invoices = docs.filter((d) => d.kind === "invoice");
  const invoiced = invoices.reduce((a, d) => a + d.total, 0);
  const unpaid = invoices.reduce((a, d) => a + Math.max(0, d.total - (paidNow.get(d.id) ?? d.paid)), 0);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">Quotes &amp; invoices</h1>
        <p className="mt-1 text-sm text-muted">Every quotation and invoice you&apos;ve made, ready to share again.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-[13px] text-muted">Invoiced</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{lkr(invoiced)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[13px] text-muted">Still unpaid</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{lkr(unpaid)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {[
          ["", "All"],
          ["quote", "Quotations"],
          ["invoice", "Invoices"],
        ].map(([key, label]) => (
          <Link key={label} href={key ? `/admin/documents?kind=${key}` : "/admin/documents"} className={cn("chip", kind === key && "chip-active")}>
            {label}
          </Link>
        ))}
      </div>
      {docs.length ? (
        <ul className="space-y-3">
          {docs.map((d) => {
            const paid = paidNow.get(d.id) ?? d.paid;
            const status = d.kind === "quote" ? "Quotation" : paid >= d.total ? "Paid" : paid > 0 ? "Part paid" : "Unpaid";
            return (
              <li key={d.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[15px] font-semibold">{d.number}</p>
                    <Link href={`/admin/customers/${d.customer_phone}`} className="block truncate text-[15px] text-ink">
                      {d.customer_name || `+${d.customer_phone}`}
                    </Link>
                    <p className="text-xs text-muted">
                      {formatDate(d.issued_on)}
                      {d.order_code && (
                        <>
                          {" · "}
                          <Link href={`/admin/orders/${d.order_code}`} className="underline underline-offset-2">
                            {d.order_code}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[17px] font-semibold tabular-nums">{lkr(d.total)}</p>
                    <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[11px]", status === "Paid" ? "bg-ink text-white" : status === "Quotation" ? "bg-surface text-muted" : "bg-rose-50 text-orchid")}>{status}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <DocumentActions id={d.id} number={d.number} kind={d.kind} compact />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="card p-6 text-center text-sm text-muted">Nothing yet. Make a quotation from an order or a customer page.</p>
      )}
    </div>
  );
}
