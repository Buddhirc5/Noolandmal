import Link from "next/link";
import { notFound } from "next/navigation";
import { listOrderRows } from "@/lib/server/admin-data";
import { getMeasurements, lkDate } from "@/lib/server/studio";
import { MeasurementsPanel } from "@/components/admin/MeasurementsPanel";
import { OrderTable } from "@/components/admin/OrderTable";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";

export const metadata = { title: "Customer" };

export default async function Customer({ params }: PageProps<"/admin/customers/[phone]">) {
  const phone = (await params).phone.replace(/\D/g, "");
  if (phone.length < 9) notFound();
  const [rows, saved] = await Promise.all([listOrderRows(), getMeasurements(phone)]);
  const mine = rows.filter((r) => r.order.customer_phone === phone);
  const name = saved?.name || mine.find((r) => r.order.customer_name)?.order.customer_name || "";
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-muted hover:text-green-900">
          ← Customers
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-green-900">{name || "New customer"}</h1>
          <a className="btn-wa" href={waLink(`Hi ${name.split(" ")[0] || ""}, this is Nool & Mal. `, phone)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="size-4" /> +{phone}
          </a>
          <Link href="/admin/orders/new" className="btn-secondary">
            New order
          </Link>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MeasurementsPanel phone={phone} name={name} saved={saved} today={lkDate(new Date())} />
        <section>
          <h2 className="mb-3 font-semibold text-green-900">Orders</h2>
          <OrderTable rows={mine} empty="No orders yet for this number." />
        </section>
      </div>
    </div>
  );
}
