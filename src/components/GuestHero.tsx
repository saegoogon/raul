import Link from "next/link";
import { InviteNight } from "@/components/InviteNight";
import { Mascot } from "@/components/Mascot";

export function GuestHero() {

  return (
    <section className="surface overflow-hidden px-5 py-6 sm:px-6">
      <div className="flex items-center gap-4">
        <Mascot size="lg" bob priority />
        <div>
          <p className="text-xl">
            blacksmile
            <span className="ml-2 text-sm text-mute">one night only</span>
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-mute">
            Post a photo. It vanishes in 24 hours. No follow.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/signup" className="btn-primary text-sm">
          Join
        </Link>
        <InviteNight className="btn-secondary text-sm" />
      </div>
    </section>
  );
}
