import { db } from "@/lib/server/db";
import { formatDateTime } from "@/lib/format";
import type { AuditRow } from "@/lib/types";

export const metadata = { title: "Audit log" };

export default async function Audit() {
  const rows = await db.list<AuditRow>("admin_audit_log", { order: { column: "created_at", ascending: false }, limit: 200 });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl font-semibold text-green-900">Audit log</h1>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Who</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-muted">{formatDateTime(r.created_at)}</td>
                <td className="px-4 py-2">{r.actor}</td>
                <td className="px-4 py-2 font-medium">{r.action}</td>
                <td className="px-4 py-2 text-xs">
                  {r.entity} {r.entity_id}
                </td>
                <td className="max-w-xs truncate px-4 py-2 font-mono text-[11px] text-muted" title={JSON.stringify(r.detail)}>
                  {JSON.stringify(r.detail)}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  No admin actions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
