"use client";
// Wishlist kept on the customer's device (no account needed). Items can be a
// design, or a design with their chosen version / colour (`query`).
import { useSyncExternalStore } from "react";

export interface WishItem {
  /** slug, plus the chosen options when saved from the customiser */
  id: string;
  slug: string;
  name: string;
  image: string | null;
  /** customiser query string, e.g. "v=off-shoulder-fold&c=main.emerald" */
  query: string;
  /** short summary of the chosen options */
  detail: string;
  price: number;
  addedAt: string;
}

const KEY = "nm_wishlist_v1";
const EVENT = "nm-wishlist";
const EMPTY: WishItem[] = [];
let cache: { raw: string | null; items: WishItem[] } = { raw: null, items: EMPTY };

function read(): WishItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.items;
    const items = raw ? (JSON.parse(raw) as WishItem[]).filter((x) => x && x.id && x.slug) : EMPTY;
    cache = { raw, items };
    return items;
  } catch {
    return EMPTY;
  }
}

function write(items: WishItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useWishlist() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    items,
    has: (id: string) => items.some((x) => x.id === id),
    add: (item: Omit<WishItem, "addedAt">) => {
      if (read().some((x) => x.id === item.id)) return;
      write([{ ...item, addedAt: new Date().toISOString() }, ...read()]);
      navigator.sendBeacon?.("/api/events", JSON.stringify({ type: "wishlist_add", path: `/collection/${item.slug}` }));
    },
    remove: (id: string) => write(read().filter((x) => x.id !== id)),
    clear: () => write([]),
  };
}
