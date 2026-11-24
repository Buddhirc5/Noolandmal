import Link from "next/link";
import { listOrderRows } from "@/lib/server/admin-data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function Customers() {
  const rows = (await listOrderRows()).filter((r) => r.order.customer_phone || r.order.customer_name);
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = r.order.customer_phone || r.order.customer_name.toLowerCase();
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight text-green-900">Customers</h1>
      <div className="card divide-y divide-line">
        {[...groups].map(([k, list]) => (
          <div key={k} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
            <div className="w-56 shrink-0">
              <p className="font-medium text-green-900">{list[0].order.customer_name || "Unnamed"}</p>
              {list[0].order.customer_phone && (
                <a href={`https://wa.me/${list[0].order.customer_phone}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700">
                  +{list[0].order.customer_phone}
                </a>
              )}
              <p className="text-xs text-muted">Since {formatDate(list.at(-1)!.order.created_at)}</p>
            </div>
            <ul className="flex flex-1 flex-wrap gap-2">
              {list.map((r) => (
                <li key={r.order.id}>
                  <Link href={`/admin/orders/${r.order.code}`} className="chip gap-2">
                    {r.order.code} <StatusBadge status={r.order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!groups.size && <p className="p-6 text-sm text-muted">No customers with contact details yet.</p>}
      </div>
    </div>
  );
}
