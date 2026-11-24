import { MyOrders } from "@/components/account/MyStuff";

export const metadata = { title: "My orders", robots: { index: false } };

export default function Page() {
  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="h-display mb-8 text-5xl">My orders</h1>
      <MyOrders />
    </div>
  );
}
