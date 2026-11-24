import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Accent } from "./Accent";

export function CtaBand({ title = "Ready to design your *dress*?", sub = "It takes about two minutes. No account needed." }: { title?: string; sub?: string }) {
  return (
    <section className="mt-24 rounded-[40px] bg-night px-6 py-16 text-center text-white md:py-20">
      <h2 className="mx-auto max-w-2xl text-[2.4rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl">
        <Accent text={title} />
      </h2>
      <p className="mx-auto mt-4 max-w-md text-white/75">{sub}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/collection" className="btn-gold h-12 px-7">
          Start designing <ArrowUpRight className="size-4" aria-hidden />
        </Link>
        <Link href="/custom" className="btn h-12 border border-white/25 px-7 text-white hover:bg-white/10">
          Send us your dream design
        </Link>
      </div>
    </section>
  );
}
