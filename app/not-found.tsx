import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ivory p-6 text-center">
      <Logo variant="icon" size={56} />
      <p className="eyebrow mt-6">404</p>
      <h1 className="h-display mt-2 text-5xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-sm text-muted">If you were looking for an order, use your code and phone number on the tracker.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Go home
        </Link>
        <Link href="/track" className="btn-secondary">
          Track an order
        </Link>
      </div>
    </div>
  );
}
