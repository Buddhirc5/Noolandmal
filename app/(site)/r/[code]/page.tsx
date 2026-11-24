/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/server/db";
import { signedUrl } from "@/lib/server/storage";
import { canAccess, getOrder } from "@/lib/server/orders";
import { getAdmin, getGuestId, getUser } from "@/lib/server/auth";
import { isValidCode, normalizeCode } from "@/lib/codes";
import { formatDate, formatDateTime } from "@/lib/format";
import { STATUS_INFO } from "@/lib/status";
import type { CustomRequest, RequestFile } from "@/lib/types";

export const metadata: Metadata = { title: "Custom request", robots: { index: false, follow: false } };

/** Request details & photos. Visible to the admin, the requester's device, or anyone holding the secret link. */
export default async function RequestPage({ params, searchParams }: PageProps<"/r/[code]">) {
  const code = normalizeCode((await params).code);
  const k = (await searchParams).k;
  if (!isValidCode(code, "CR")) notFound();
  const order = await getOrder(code);
  if (!order?.custom_request_id) notFound();
  const [admin, guestId, user] = await Promise.all([getAdmin(), getGuestId(), getUser()]);
  if (!canAccess(order, { key: typeof k === "string" ? k : null, guestId, userId: user?.id, admin })) notFound();
  const req = await db.get<CustomRequest>("custom_requests", { id: order.custom_request_id });
  if (!req) notFound();
  const files = await db.list<RequestFile>("request_files", { eq: { custom_request_id: req.id } });
  const urls = await Promise.all(files.map((f) => signedUrl("references", f.path, 900)));

  return (
    <div className="container-x max-w-4xl py-10 md:py-16">
      <p className="eyebrow">Custom request</p>
      <h1 className="h-display mt-2 text-5xl">{req.code}</h1>
      <p className="mt-2 text-sm text-muted">
        Received {formatDateTime(req.created_at)} · Status: <span className="badge">{STATUS_INFO[order.status].label}</span>
      </p>
      <dl className="card mt-8 grid gap-x-8 gap-y-4 p-6 text-sm sm:grid-cols-2">
        {[
          ["Name", req.name],
          ["Occasion", req.occasion],
          ["Needed by", req.needed_by ? formatDate(req.needed_by) : "Flexible"],
          ["Budget", req.budget || "Not set"],
          ["Size notes", req.size_notes || "—"],
        ].map(([t, d]) => (
          <div key={t}>
            <dt className="text-muted">{t}</dt>
            <dd className="mt-0.5 text-ink">{d}</dd>
          </div>
        ))}
        <div className="sm:col-span-2">
          <dt className="text-muted">Reference link</dt>
          <dd className="mt-0.5 break-all">
            {req.reference_url ? (
              <a className="text-green-700 underline" href={req.reference_url} target="_blank" rel="noopener noreferrer nofollow">
                {req.reference_url}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">Notes</dt>
          <dd className="mt-0.5 whitespace-pre-wrap text-ink">{req.notes || "—"}</dd>
        </div>
      </dl>
      <h2 className="mt-10 text-3xl font-semibold tracking-tight text-green-900">Photos ({files.length})</h2>
      {files.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((u, i) => (
            <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-line bg-paper">
              <img src={u} alt={`Reference photo ${i + 1}`} className="aspect-[3/4] w-full object-cover" />
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">No photos were uploaded.</p>
      )}
      <p className="mt-6 text-xs text-muted">Photo links expire after 15 minutes. Reload the page for fresh links.</p>
    </div>
  );
}
