import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Mascot } from "@/components/Mascot";

export function GuestHero() {
  return (
    <section className="bs-hero surface overflow-hidden px-5 pb-7 pt-6 text-center">
      <div className="relative">
        <Mascot size="xl" pose="sit" bob priority className="mx-auto" />
        <p className="text-2xl font-semibold tracking-tight">
          <BrandMark />
        </p>
        <p className="mt-1 text-sm text-mute">One night only</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mute">
          A story in the dark. Talk, wait, spare. Do not grind.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/play" className="btn-primary text-sm">
            Play tonight
          </Link>
          <Link href="/rank" className="btn-secondary text-sm">
            Ranking
          </Link>
        </div>
      </div>
    </section>
  );
}
