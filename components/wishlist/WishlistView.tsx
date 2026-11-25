"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { lkr } from "@/lib/format";

export function WishlistView({ siteUrl }: { siteUrl: string }) {
  const w = useWishlist();
  if (!w.items.length)
    return (
      <div className="mx-auto mt-12 max-w-md rounded-[32px] bg-surface p-10 text-center">
        <Heart className="mx-auto size-8 text-pink" aria-hidden />
        <p className="mt-4 text-lg font-semibold text-ink">Nothing saved yet</p>
        <p className="mt-2 text-[15px] text-muted">Tap the heart on any design — or choose your colour and tap Save — to keep it here.</p>
        <Link href="/collection" className="btn-primary mt-6 h-12 px-6">
          Browse the collection
        </Link>
      </div>
    );

  const href = (q: string, slug: string) => `/collection/${slug}${q ? `?${q}` : ""}`;
  const message = [
    "Hi Nool & Mal, I'd love a quotation for these from my wishlist:",
    ...w.items.map((x, i) => `${i + 1}. ${x.name}${x.detail ? ` (${x.detail})` : ""} — ${siteUrl}${href(x.query, x.slug)}`),
  ].join("\n");
  const from = Math.min(...w.items.map((x) => x.price));

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <ul className="space-y-3">
        {w.items.map((x) => (
          <li key={x.id} className="card flex items-center gap-4 p-3">
            <Link href={href(x.query, x.slug)} className="relative h-28 w-22 shrink-0 overflow-hidden rounded-[16px] bg-surface-2">
              {x.image && <Image src={x.image} alt="" fill sizes="88px" className="object-cover object-top" />}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={href(x.query, x.slug)} className="block text-[17px] leading-snug font-semibold text-ink">
                {x.name}
              </Link>
              {x.detail && <p className="mt-0.5 truncate text-[14px] text-muted">{x.detail}</p>}
              <p className="mt-1 text-[14px] text-ink">from {lkr(x.price)}</p>
              <Link href={href(x.query, x.slug)} className="mt-2 inline-block text-[14px] font-medium text-pink underline-offset-4 hover:underline">
                Choose & get a quote
              </Link>
            </div>
            <button type="button" className="flex size-11 shrink-0 items-center justify-center self-start rounded-full text-muted hover:bg-surface" aria-label={`Remove ${x.name}`} onClick={() => w.remove(x.id)}>
              <X className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-24 z-20 mt-6 rounded-[24px] bg-ink sm:bottom-3 p-4 text-white shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] text-white/60">
              {w.items.length} saved · from {lkr(from)}
            </p>
            <p className="text-[15px] font-medium">Send them all to Roshini for one quotation</p>
          </div>
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa h-12 px-5"
            onClick={() => navigator.sendBeacon?.("/api/events", JSON.stringify({ type: "wishlist_send", path: "/wishlist" }))}
          >
            <WhatsAppIcon className="size-5" /> Send on WhatsApp
          </a>
        </div>
      </div>
      <p className="mt-4 text-center text-[13px] text-muted">
        Your wishlist is saved on this device.{" "}
        <button type="button" className="underline underline-offset-4" onClick={() => confirm("Clear your wishlist?") && w.clear()}>
          Clear all
        </button>
      </p>
    </div>
  );
}
