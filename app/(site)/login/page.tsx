import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInPanel } from "@/components/auth/SignInPanel";
import { accountsEnabled, getUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getUser()) redirect("/account");
  const { error } = await searchParams;
  return (
    <div className="container-x flex justify-center py-16">
      <div className="card w-full max-w-md p-7">
        <p className="eyebrow">Optional account</p>
        <h1 className="h-display mt-2 text-4xl">Log in</h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-muted">
          An account keeps your saved designs and orders together on every device. You never need one to design or order — designs on this device are added to your account when you sign in.
        </p>
        {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-[#8a2f2a]">That sign-in link didn&apos;t work. Please try again.</p>}
        {accountsEnabled ? (
          <SignInPanel next="/account" />
        ) : (
          <p className="rounded-xl bg-gold-50 p-4 text-sm">
            Accounts aren&apos;t switched on yet. Your designs are still saved on this device — see{" "}
            <Link href="/account" className="text-green-700 underline">
              My designs
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
