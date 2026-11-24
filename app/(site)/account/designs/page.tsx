import { MyDesigns } from "@/components/account/MyStuff";

export const metadata = { title: "My designs", robots: { index: false } };

export default function Page() {
  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="h-display mb-8 text-5xl">My designs</h1>
      <MyDesigns />
    </div>
  );
}
