import type { Metadata } from "next";
import Link from "next/link";
import { MyDesigns, MyOrders } from "@/components/account/MyStuff";
import { accountsEnabled, getUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "My designs & orders", robots: { index: false } };

export default async function AccountPage() {
  const user = await getUser();
  return (
    <div className="container-x py-10 md:py-14">
      <p className="eyebrow">{user ? user.email : "Saved on this device"}</p>
      <h1 className="h-display mt-2 text-5xl">My designs</h1>
      {!user && accountsEnabled && (
        <p className="mt-3 text-sm text-muted">
          <Link href="/login" className="text-green-700 underline">
            Log in
          </Link>{" "}
          to keep these on all your devices.
        </p>
      )}
      <section id="designs" className="mt-8">
        <MyDesigns />
      </section>
      <section id="orders" className="mt-12">
        <h2 className="mb-4 font-serif text-3xl font-semibold text-green-900">Orders</h2>
        <MyOrders />
      </section>
    </div>
  );
}
