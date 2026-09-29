import Link from "next/link";
import { InviteNight } from "@/components/InviteNight";
import { Mascot } from "@/components/Mascot";

export function GuestHero() {
  return (
    <section className="bs-hero surface overflow-hidden px-5 pb-7 pt-6 text-center">
      <div className="relative">
        <Mascot size="xl" pose="sit" bob priority className="mx-auto" />
        <p className="text-2xl font-semibold tracking-tight">
          black<span className="text-smile">smile</span>
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-mute">
          one night only
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mute">
          Post a photo. It vanishes in 24 hours. No follow.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/signup" className="btn-primary text-sm">
            Join
          </Link>
          <InviteNight className="btn-secondary text-sm" />
        </div>
      </div>
    </section>
  );
}
