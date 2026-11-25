"use client";
import { Heart } from "lucide-react";
import { useWishlist, type WishItem } from "@/lib/wishlist";
import { cn } from "@/lib/format";

/** Save / unsave a design. Sits on top of design cards and in the customiser. */
export function HeartButton({ item, className, label = false }: { item: Omit<WishItem, "addedAt">; className?: string; label?: boolean }) {
  const w = useWishlist();
  const on = w.has(item.id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (on) w.remove(item.id);
        else w.add(item);
      }}
      className={cn(
        label ? "btn-secondary h-14 gap-2 px-5" : "flex size-10 items-center justify-center rounded-full bg-paper/95 shadow-sm backdrop-blur transition-transform active:scale-90",
        className,
      )}
    >
      <Heart className={cn("size-[18px] transition-colors", on ? "fill-pink text-pink" : "text-ink")} strokeWidth={2} aria-hidden />
      {label && (on ? "Saved" : "Save")}
    </button>
  );
}

/** Header link with a count badge. */
export function WishlistCount() {
  const { items } = useWishlist();
  if (!items.length) return null;
  return <span className="absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full bg-pink px-1 text-center text-[11px] leading-[18px] font-semibold text-white">{items.length}</span>;
}
