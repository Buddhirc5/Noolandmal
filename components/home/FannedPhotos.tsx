import Image from "next/image";
import Link from "next/link";

export interface FanItem {
  src: string;
  alt: string;
  href: string;
}

/** A fanned stack of rounded photo cards (the centre card is upright and on top). */
export function FannedPhotos({ items }: { items: FanItem[] }) {
  // positions for up to 5 cards: [translateX %, rotate deg, scale, z, hiddenOnMobile]
  const slots: [number, number, number, number, boolean][] = [
    [-118, -10, 0.78, 1, true],
    [-62, -6, 0.88, 2, false],
    [0, 0, 1, 5, false],
    [62, 6, 0.88, 2, false],
    [118, 10, 0.78, 1, true],
  ];
  const offset = Math.floor((slots.length - items.length) / 2);
  return (
    <div className="relative mx-auto h-[380px] w-full max-w-5xl sm:h-[520px]" aria-label="Featured designs">
      {items.map((it, i) => {
        const [x, rot, scale, z, mobileHidden] = slots[i + offset];
        return (
          <Link
            key={it.src}
            href={it.href}
            className={`group absolute top-0 left-1/2 h-[340px] w-[240px] overflow-hidden rounded-[30px] bg-surface shadow-[0_30px_60px_-28px_rgb(20_32_28/0.45)] ring-1 ring-black/5 transition-transform duration-300 ease-out hover:-translate-y-2 sm:h-[470px] sm:w-[330px] ${mobileHidden ? "hidden md:block" : ""}`}
            style={{ transform: `translateX(calc(-50% + ${x}%)) rotate(${rot}deg) scale(${scale})`, zIndex: z }}
          >
            <Image src={it.src} alt={it.alt} fill priority={i === Math.floor(items.length / 2)} quality={70} sizes="(max-width: 640px) 240px, 330px" className="object-cover" />
          </Link>
        );
      })}
    </div>
  );
}
