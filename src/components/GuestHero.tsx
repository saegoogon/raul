import Link from "next/link";
import { InviteNight } from "@/components/InviteNight";
import { SmileMark } from "@/components/SmileMark";

export function GuestHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) return null;

  return (
    <section className="border border-line bg-ink p-4">
      <div className="flex items-start gap-3">
        <SmileMark className="mt-0.5 h-8 w-8 shrink-0 text-smile" />
        <div>
          <p className="text-lg">
            blacksmile
            <span className="ml-2 text-sm text-mute">one night only</span>
          </p>
          <p className="mt-1 text-sm text-mute">
            Post a photo. It vanishes in 24 hours. No follow.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/signup"
          className="border border-smile bg-smile px-3 py-1.5 text-sm text-night"
        >
          Join
        </Link>
        <InviteNight className="border border-line px-3 py-1.5 text-sm text-paper" />
      </div>
    </section>
  );
}
