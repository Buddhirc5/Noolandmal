import type { Metadata } from "next";
import { TrackForm } from "@/components/order/TrackForm";
import { normalizeCode } from "@/lib/codes";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Nool & Mal order with your design code and phone number.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const { code } = await searchParams;
  return (
    <div className="container-x flex justify-center py-14">
      <div className="w-full max-w-md">
        <p className="eyebrow">Order tracker</p>
        <h1 className="h-display mt-2 text-5xl">Where&apos;s my dress?</h1>
        <p className="mt-3 mb-8 text-[15px] leading-7 text-muted">Enter your code (NM-… or CR-…) and the WhatsApp number you gave us. No account needed.</p>
        <div className="card p-6">
          <TrackForm initialCode={typeof code === "string" ? normalizeCode(code) : ""} />
        </div>
        <p className="mt-6 text-sm text-muted">
          We only show orders once a phone number is linked to the code. If you didn&apos;t add one, just message us your code on WhatsApp.
        </p>
      </div>
    </div>
  );
}
