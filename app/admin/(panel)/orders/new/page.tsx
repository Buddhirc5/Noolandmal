import Link from "next/link";
import { NewOrderForm } from "@/components/admin/NewOrderForm";
import { listDesigns } from "@/lib/server/catalog";
import { lkDate } from "@/lib/server/studio";

export const metadata = { title: "New order" };

export default async function NewOrder({ searchParams }: PageProps<"/admin/orders/new">) {
  const phone = String((await searchParams).phone ?? "").replace(/[^\d+]/g, "").slice(0, 15);
  const designs = await listDesigns({ includeUnpublished: true });
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/requests" className="text-sm text-muted hover:text-green-900">
          ← Orders
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-green-900 md:text-4xl">New order</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">For orders that didn&apos;t start on the website — a WhatsApp chat, an Instagram message or a walk-in. It works just like a website order: quotation, payments, measurements and progress.</p>
      </div>
      <div className="max-w-2xl">
        <NewOrderForm designs={designs.map((d) => ({ id: d.id, name: d.name }))} today={lkDate(new Date())} initialPhone={phone} />
      </div>
    </div>
  );
}
