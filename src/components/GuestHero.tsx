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
        <p className="mt-1 text-sm text-mute">A small smile can change your world</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mute">
          You are BlackSmile. Talk to Nyang, Jenny, Flower. Spare the slime.
          Do not grind.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/play" className="btn-primary text-sm">
            Play tonight
          </Link>
          <Link href="/login" className="btn-secondary text-sm">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
