export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-paper py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <p className="sr-only">Made for: {items.join(", ")}</p>
      <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none" aria-hidden>
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-serif text-2xl text-green-900/80 italic">
            {t}
            <span className="size-1.5 rounded-full bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}
