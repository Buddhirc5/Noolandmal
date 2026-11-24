import Link from "next/link";

export function CtaBand({ title = "Ready to design your dress?", sub = "It takes about two minutes. No account needed." }: { title?: string; sub?: string }) {
  return (
    <section className="mt-20 rounded-[28px] bg-green-900 px-6 py-14 text-center text-white">
      <h2 className="font-serif text-4xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-white/75">{sub}</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/collection" className="btn-gold h-12 px-7">
          Start designing
        </Link>
        <Link href="/custom" className="btn h-12 border border-white/30 px-7 text-white hover:bg-white/10">
          Send us your dream design
        </Link>
      </div>
    </section>
  );
}
