import Link from "next/link";
import { listOrderRows } from "@/lib/server/admin-data";
import { OrderTable } from "@/components/admin/OrderTable";
import { STATUS_INFO } from "@/lib/status";
import { ORDER_STATUSES } from "@/lib/types";

export const metadata = { title: "Requests" };

export default async function Requests({ searchParams }: PageProps<"/admin/requests">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const kind = typeof sp.kind === "string" ? sp.kind : "";
  const view = typeof sp.view === "string" ? sp.view : "";
  const q = typeof sp.q === "string" ? sp.q.toLowerCase().trim() : "";
  let rows = await listOrderRows();
  if (status) rows = rows.filter((r) => r.order.status === status);
  if (kind) rows = rows.filter((r) => r.order.kind === kind);
  if (view === "not_received") rows = rows.filter((r) => r.order.kind !== "manual" && !r.order.received_at && ["draft", "quote_requested"].includes(r.order.status));
  if (view === "to_quote") rows = rows.filter((r) => (r.order.received_at || r.order.kind === "manual") && r.order.status === "quote_requested");
  if (view === "balance") rows = rows.filter((r) => !r.order.paid_in_full && ["ready", "delivered", "collected"].includes(r.order.status));
  if (q) rows = rows.filter((r) => [r.order.code, r.order.customer_name, r.order.customer_phone, r.title].join(" ").toLowerCase().includes(q));
  const link = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ ...(status && { status }), ...(kind && { kind }), ...(view && { view }), ...(q && { q }), ...patch });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    return `/admin/requests${p.size ? `?${p}` : ""}`;
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">Orders</h1>
        <p className="mt-1 text-sm text-muted">Every code a customer makes on the website (NM- designs, CR- custom requests) plus orders you add yourself. Open one to mark it received, quote it and tick off each step.</p>
      </div>
      <form className="flex gap-2" action="/admin/requests">
        <input name="q" defaultValue={q} placeholder="Search code, name, phone…" className="input h-11 min-w-0 flex-1 rounded-full md:max-w-xs md:flex-none" />
        {status && <input type="hidden" name="status" value={status} />}
        {kind && <input type="hidden" name="kind" value={kind} />}
        <button className="btn-secondary">Search</button>
      </form>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
        {[
          ["", "All"],
          ["design", "Customiser (NM)"],
          ["custom", "Custom (CR)"],
          ["manual", "Added by studio"],
        ].map(([k, l]) => (
          <Link key={l} href={link({ kind: k })} className={`chip shrink-0 whitespace-nowrap ${kind === k ? "chip-active" : ""}`}>
            {l}
          </Link>
        ))}
        <span className="mx-1 w-px bg-line" />
        {[
          ["", "All tickets"],
          ["not_received", "Not received"],
          ["to_quote", "To quote"],
          ["balance", "Balance due"],
        ].map(([k, l]) => (
          <Link key={l} href={link({ view: k })} className={`chip shrink-0 whitespace-nowrap ${view === k ? "chip-active" : ""}`}>
            {l}
          </Link>
        ))}
        <span className="mx-1 w-px bg-line" />
        <Link href={link({ status: "" })} className={`chip shrink-0 whitespace-nowrap ${!status ? "chip-active" : ""}`}>
          Any status
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={link({ status: s })} className={`chip shrink-0 whitespace-nowrap ${status === s ? "chip-active" : ""}`}>
            {STATUS_INFO[s].label}
          </Link>
        ))}
      </div>
      <OrderTable rows={rows} empty="No requests match." />
    </div>
  );
}
