import Link from "next/link";
import { db } from "@/lib/server/db";
import { getGuestId, getUser } from "@/lib/server/auth";
import { listDesignCards, loadCatalog } from "@/lib/server/catalog";
import { colorHex } from "@/lib/colors";
import { formatDate, lkrRange } from "@/lib/format";
import Image from "next/image";
import { photosFor } from "@/lib/photos";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Configuration, Order } from "@/lib/types";

async function mine() {
  const [guestId, user] = await Promise.all([getGuestId(), getUser()]);
  const lists = await Promise.all([
    guestId ? db.list<Order>("orders", { eq: { guest_id: guestId } }) : [],
    user ? db.list<Order>("orders", { eq: { user_id: user.id } }) : [],
    guestId ? db.list<Configuration>("configurations", { eq: { guest_id: guestId } }) : [],
    user ? db.list<Configuration>("configurations", { eq: { user_id: user.id } }) : [],
  ]);
  const uniq = <T extends { id: string; created_at: string }>(a: T[]) => [...new Map(a.map((x) => [x.id, x])).values()].sort((x, y) => (x.created_at < y.created_at ? 1 : -1));
  return { orders: uniq([...lists[0], ...lists[1]]), configs: uniq([...lists[2], ...lists[3]]), user };
}

export async function MyDesigns() {
  const [{ configs, orders }, cards, catalog] = await Promise.all([mine(), listDesignCards({ includeUnpublished: true }), loadCatalog()]);
  if (!configs.length)
    return (
      <div className="card p-8 text-center">
        <p className="font-serif text-2xl text-green-900">No saved designs yet</p>
        <p className="mt-2 text-sm text-muted">Designs you get a code for are saved here automatically.</p>
        <Link href="/collection" className="btn-primary mt-5">
          Start designing
        </Link>
      </div>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {configs.map((c) => {
        const card = cards.find((x) => x.design.id === c.design_id);
        const order = orders.find((o) => o.code === c.code);
        const cover = card ? photosFor({ design: card.design, regions: card.regions }, { version: c.selections.version ?? null, colors: c.selections.colors }).images[0] : undefined;
        return (
          <article key={c.id} className="card flex gap-4 p-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-[16px] bg-surface-2">{cover && <Image src={cover} alt="" fill sizes="80px" className="object-cover" />}</div>
            <div className="min-w-0 text-sm">
              <p className="font-mono text-xs text-muted">{c.code}</p>
              <p className="font-semibold text-green-900">{card?.design.name ?? c.design_slug}</p>
              <p className="text-xs text-muted">
                {formatDate(c.created_at)} · {lkrRange(c.price_min, c.price_max)}
              </p>
              {order && (
                <div className="mt-1">
                  <StatusBadge status={order.status} />
                </div>
              )}
              <div className="mt-2 flex gap-3 text-xs">
                <Link href={`/d/${c.code}`} className="text-green-700 underline">
                  Open
                </Link>
                {order && (
                  <Link href={`/q/${c.code}`} className="text-green-700 underline">
                    Order page
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export async function MyOrders() {
  const { orders } = await mine();
  const active = orders.filter((o) => o.status !== "draft");
  if (!active.length) return <p className="card p-6 text-sm text-muted">No orders yet. Once you send a design or request on WhatsApp it appears here.</p>;
  return (
    <ul className="card divide-y divide-line">
      {active.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center gap-3 p-4">
          <Link href={`/q/${o.code}`} className="font-mono font-medium text-green-900 underline-offset-2 hover:underline">
            {o.code}
          </Link>
          <span className="text-sm text-muted">{o.kind === "custom" ? "Custom request" : "Design"}</span>
          <span className="ml-auto">
            <StatusBadge status={o.status} />
          </span>
        </li>
      ))}
    </ul>
  );
}

