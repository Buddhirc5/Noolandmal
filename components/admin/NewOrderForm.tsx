"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner, useAction } from "./ui";
import { createManualOrderAction } from "@/app/admin/studio-actions";
import { lookupCustomerAction } from "@/app/admin/customer-actions";

type Lookup = Awaited<ReturnType<typeof lookupCustomerAction>>;

/**
 * Orders that didn't start on the website (WhatsApp, Instagram, walk-ins).
 * The WhatsApp number is the customer's ID, so it comes first and is checked as you type.
 */
export function NewOrderForm({ designs, today, initialPhone = "" }: { designs: { id: string; name: string }[]; today: string; initialPhone?: string }) {
  const a = useAction();
  const router = useRouter();
  const [v, setV] = useState({ name: "", phone: initialPhone, title: "", details: "", neededBy: "", designId: "" });
  const [found, setFound] = useState<Lookup | null>(null);
  const [checking, setChecking] = useState(false);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    const digits = v.phone.replace(/\D/g, "");
    if (digits.length < 9) return setFound(null);
    setChecking(true);
    const t = setTimeout(async () => {
      const r = await lookupCustomerAction(v.phone);
      setFound(r);
      setChecking(false);
      if (r.valid && r.exists && r.name) setV((x) => (x.name ? x : { ...x, name: r.name }));
    }, 350);
    return () => clearTimeout(t);
  }, [v.phone]);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        a.run(
          () => createManualOrderAction({ ...v, neededBy: v.neededBy || null, designId: v.designId || null }),
          (r) => router.push(`/admin/orders/${r.data as string}#documents`),
        );
      }}
    >
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-ink">Customer</h2>
        <label className="block text-sm">
          <span className="label">WhatsApp number — their customer ID</span>
          <input className="input h-12 text-[17px] tabular-nums" type="tel" inputMode="tel" autoComplete="off" value={v.phone} onChange={set("phone")} placeholder="07X XXX XXXX" required />
        </label>
        {checking && <p className="text-sm text-muted">Checking…</p>}
        {!checking && found?.valid && found.exists && (
          <div className="rounded-[18px] bg-ink p-4 text-white">
            <p className="text-[13px] text-white/60">Returning customer</p>
            <p className="mt-0.5 text-lg font-semibold">{found.name || "Name not saved"}</p>
            <p className="mt-1 text-sm text-white/75">
              {found.orders} order{found.orders === 1 ? "" : "s"}
              {found.lastOrder ? ` · last ${found.lastOrder}` : ""} · {found.measured ? "measurements saved" : "no measurements yet"}
            </p>
            <Link href={`/admin/customers/${found.phone}`} className="mt-2 inline-block text-sm font-medium text-pink-light underline underline-offset-4">
              Open customer
            </Link>
          </div>
        )}
        {!checking && found?.valid && !found.exists && <p className="rounded-[14px] bg-rose-50 px-4 py-2.5 text-sm text-orchid">New customer — +{found.phone} will be saved as their ID.</p>}
        {found && !found.valid && <p className="text-sm text-danger">That doesn&apos;t look like a full number yet.</p>}
        <label className="block text-sm">
          <span className="label">Name</span>
          <input className="input h-12" value={v.name} onChange={set("name")} required />
        </label>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold text-ink">Order</h2>
        <label className="block text-sm">
          <span className="label">What are you making?</span>
          <input className="input h-12" value={v.title} onChange={set("title")} placeholder="e.g. Maroon velvet saree blouse" required />
        </label>
        <label className="block text-sm">
          <span className="label">Similar catalogue design <span className="font-normal text-muted">(optional)</span></span>
          <select className="input h-12" value={v.designId} onChange={set("designId")}>
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
          <textarea className="input" rows={3} value={v.details} onChange={set("details")} placeholder="Fabric, colour, neckline, sleeves, reference photo on WhatsApp…" />
        </label>
        <label className="block text-sm">
          <span className="label">Needed by <span className="font-normal text-muted">(optional)</span></span>
          <input className="input h-12" type="date" min={today} value={v.neededBy} onChange={set("neededBy")} />
        </label>
      </section>

      <button className="btn-primary h-14 w-full text-[16px]" disabled={a.pending || (found !== null && !found.valid)}>
        {a.pending && <Spinner />} Create order
      </button>
      <a.Feedback />
      <p className="text-center text-xs text-muted">Next: write the quotation and share it as a PDF.</p>
    </form>
  );
}
