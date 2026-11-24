import { listCreatorApplications } from "@/lib/server/creators";
import { updateCreatorStatus } from "@/app/admin/creator-actions";
import { requireAdmin } from "@/lib/server/auth";
import { creatorProgram } from "@/config/site";
import { formatDate } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import type { CreatorStatus } from "@/lib/creator";

export const metadata = { title: "Creators" };

const LABEL: Record<CreatorStatus, string> = { new: "New", approved: "Approved", declined: "Declined", posted: "Video posted" };
const TONE: Record<CreatorStatus, string> = { new: "bg-rose-50 text-orchid", approved: "bg-ink text-white", declined: "bg-surface text-muted", posted: "bg-pink text-white" };
const NEXT: Record<CreatorStatus, CreatorStatus[]> = { new: ["approved", "declined"], approved: ["posted", "declined"], declined: ["approved"], posted: [] };

export default async function Creators() {
  await requireAdmin();
  const apps = await listCreatorApplications();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-green-900">Creators</h1>
        <p className="mt-1 text-sm text-muted">
          Applications from /creators. Approved creators get {creatorProgram.discountPercent}% off — apply it in their quotation.
        </p>
      </div>
      {apps.length === 0 && <p className="card p-6 text-sm text-muted">No applications yet.</p>}
      <div className="space-y-3">
        {apps.map((a) => {
          const reply = waLink(
            a.status === "approved"
              ? `Hi ${a.name.split(" ")[0]}, welcome to the Nool & Mal creator programme (${a.code})! Which design would you like? Your quotation will include the ${creatorProgram.discountPercent}% partner discount.`
              : `Hi ${a.name.split(" ")[0]}, thank you for applying to the Nool & Mal creator programme (${a.code}). `,
            a.phone,
          );
          return (
            <div key={a.id} className="card flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-ink">{a.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TONE[a.status]}`}>{LABEL[a.status]}</span>
                  <span className="font-mono text-xs text-muted">{a.code}</span>
                </div>
                <p className="mt-1 text-sm text-ink">
                  {a.platform} · {a.followers} followers ·{" "}
                  {/^https?:\/\//.test(a.handle) ? (
                    <a href={a.handle} target="_blank" rel="noopener noreferrer" className="text-pink underline underline-offset-2">
                      profile
                    </a>
                  ) : (
                    a.handle
                  )}
                </p>
                <p className="mt-1 text-sm text-muted">
                  +{a.phone}
                  {a.email ? ` · ${a.email}` : ""} · applied {formatDate(a.created_at)}
                </p>
                {a.design && <p className="mt-2 text-sm text-ink">Wants: {a.design}</p>}
                {a.video_url && (
                  <a href={a.video_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-pink underline underline-offset-2">
                    Sample video
                  </a>
                )}
                {a.notes && <p className="mt-2 text-sm whitespace-pre-wrap text-muted">{a.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-2 lg:w-64 lg:justify-end">
                <a href={reply} target="_blank" rel="noopener noreferrer" className="btn-secondary h-10 px-4 text-sm">
                  WhatsApp
                </a>
                {NEXT[a.status].map((s) => (
                  <form key={s} action={updateCreatorStatus}>
                    <input type="hidden" name="code" value={a.code} />
                    <input type="hidden" name="status" value={s} />
                    <button className={`h-10 rounded-full px-4 text-sm font-medium ${s === "declined" ? "bg-surface text-muted hover:bg-surface-2" : "bg-ink text-white hover:bg-ink/85"}`}>
                      {s === "approved" ? "Approve" : s === "declined" ? "Decline" : "Mark posted"}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
