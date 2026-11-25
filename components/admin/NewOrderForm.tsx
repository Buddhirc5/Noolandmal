"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner, useAction } from "./ui";
import { createManualOrderAction } from "@/app/admin/studio-actions";

/** Orders that didn't come through the website: walk-ins, WhatsApp chats, Instagram DMs. */
export function NewOrderForm({ designs, today }: { designs: { id: string; name: string }[]; today: string }) {
  const a = useAction();
  const router = useRouter();
  const [v, setV] = useState({ name: "", phone: "", title: "", details: "", neededBy: "", designId: "" });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });
  return (
    <form
      className="card max-w-2xl space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(
          () => createManualOrderAction({ ...v, neededBy: v.neededBy || null, designId: v.designId || null }),
          (r) => router.push(`/admin/orders/${r.data as string}`),
        );
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="label">Customer name</span>
          <input className="input" value={v.name} onChange={set("name")} required />
        </label>
        <label className="text-sm">
          <span className="label">WhatsApp number</span>
          <input className="input" type="tel" value={v.phone} onChange={set("phone")} placeholder="07X XXX XXXX" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="label">What are you making?</span>
        <input className="input" value={v.title} onChange={set("title")} placeholder="e.g. Bridesmaid saree blouse in maroon velvet" required />
      </label>
      <label className="block text-sm">
        <span className="label">Similar catalogue design <span className="font-normal text-muted">(optional)</span></span>
        <select className="input" value={v.designId} onChange={set("designId")}>
          <option value="">None — fully custom</option>
          {designs.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="label">Details</span>
        <textarea className="input" rows={4} value={v.details} onChange={set("details")} placeholder="Fabric, colour, neckline, sleeves, reference photo sent on WhatsApp…" />
      </label>
      <label className="block text-sm sm:w-60">
        <span className="label">Needed by <span className="font-normal text-muted">(optional)</span></span>
        <input className="input" type="date" min={today} value={v.neededBy} onChange={set("neededBy")} />
      </label>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={a.pending}>
          {a.pending && <Spinner />} Create order
        </button>
        <a.Feedback />
      </div>
      <p className="text-xs text-muted">The order gets its own NM- code. Next you can write the quotation and copy the WhatsApp message with payment details.</p>
    </form>
  );
}
