"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner, useAction } from "./ui";
import { changePhoneAction, updateCustomerAction } from "@/app/admin/customer-actions";

/** Name, notes and — when a customer gets a new number — moving everything to it. */
export function CustomerEditor({ phone, name, notes }: { phone: string; name: string; notes: string }) {
  const a = useAction();
  const b = useAction();
  const router = useRouter();
  const [v, setV] = useState({ name, notes });
  const [newPhone, setNewPhone] = useState("");
  const [changing, setChanging] = useState(false);
  return (
    <section className="card space-y-4 p-5">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          a.run(() => updateCustomerAction(phone, v.name, v.notes));
        }}
      >
        <label className="block text-sm">
          <span className="label">Name</span>
          <input className="input h-12" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="label">Notes</span>
          <textarea className="input" rows={2} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder="e.g. prefers modest necklines, sister of Hasara" />
        </label>
        <div className="flex items-center gap-3">
          <button className="btn-primary h-11" disabled={a.pending}>
            {a.pending && <Spinner />} Save
          </button>
          <a.Feedback />
        </div>
      </form>
      <div className="border-t border-line pt-4">
        {!changing ? (
          <button type="button" className="text-sm font-medium text-ink underline underline-offset-4" onClick={() => setChanging(true)}>
            Customer changed their number?
          </button>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!confirm(`Move this customer, their orders, measurements and documents to ${newPhone}?`)) return;
              b.run(() => changePhoneAction(phone, newPhone), (r) => router.replace(`/admin/customers/${r.data as string}`));
            }}
          >
            <label className="block text-sm">
              <span className="label">New WhatsApp number</span>
              <input className="input h-12 tabular-nums" type="tel" inputMode="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="07X XXX XXXX" />
            </label>
            <p className="text-xs text-muted">Orders, measurements, quotations and invoices all move to the new number.</p>
            <div className="flex items-center gap-3">
              <button className="btn-primary h-11" disabled={b.pending || newPhone.replace(/\D/g, "").length < 9}>
                {b.pending && <Spinner />} Change number
              </button>
              <button type="button" className="text-sm text-muted" onClick={() => setChanging(false)}>
                Cancel
              </button>
            </div>
            <b.Feedback />
          </form>
        )}
      </div>
    </section>
  );
}
