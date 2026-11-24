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
  const q = typeof sp.q === "string" ? sp.q.toLowerCase().trim() : "";
  let rows = await listOrderRows();
  if (status) rows = rows.filter((r) => r.order.status === status);
  if (kind) rows = rows.filter((r) => r.order.kind === kind);
  if (q) rows = rows.filter((r) => [r.order.code, r.order.customer_name, r.order.customer_phone, r.title].join(" ").toLowerCase().includes(q));
  const link = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ ...(status && { status }), ...(kind && { kind }), ...(q && { q }), ...patch });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    return `/admin/requests${p.size ? `?${p}` : ""}`;
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-green-900">Requests inbox</h1>
        <p className="mt-1 text-sm text-muted">Quote requests from the customiser (NM-) and custom requests with links or photos (CR-).</p>
      </div>
      <form className="flex flex-wrap gap-2" action="/admin/requests">
        <input name="q" defaultValue={q} placeholder="Search code, name, phone…" className="input max-w-xs rounded-full" />
        {status && <input type="hidden" name="status" value={status} />}
        {kind && <input type="hidden" name="kind" value={kind} />}
        <button className="btn-secondary">Search</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {[
          ["", "All"],
          ["design", "Customiser (NM)"],
          ["custom", "Custom (CR)"],
        ].map(([k, l]) => (
          <Link key={l} href={link({ kind: k })} className={`chip ${kind === k ? "chip-active" : ""}`}>
            {l}
          </Link>
        ))}
        <span className="mx-1 w-px bg-line" />
        <Link href={link({ status: "" })} className={`chip ${!status ? "chip-active" : ""}`}>
          Any status
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={link({ status: s })} className={`chip ${status === s ? "chip-active" : ""}`}>
            {STATUS_INFO[s].label}
          </Link>
        ))}
      </div>
      <OrderTable rows={rows} empty="No requests match." />
    </div>
  );
}
