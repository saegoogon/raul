import Link from "next/link";
import { DarkPresence } from "@/components/DarkPresence";
import { InviteNight } from "@/components/InviteNight";
import { Mascot } from "@/components/Mascot";
import type { Profile } from "@/lib/types";

export function NightRoom({ people }: { people: Profile[] }) {
  return (
    <section className="surface px-4 py-4 sm:px-5">
      <div className="flex items-center gap-3">
        <Mascot size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base">Here tonight</h2>
          <div className="mt-0.5">
            <DarkPresence />
          </div>
        </div>
        <Link href="/play" className="btn-primary shrink-0 px-3 py-1.5 text-sm">
          Play
        </Link>
      </div>

      {people.length === 0 ? (
        <p className="mt-4 text-sm text-mute">The room is still empty.</p>
      ) : (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/u/${person.username}`}
              className="shrink-0 rounded-full border border-line px-3 py-1 text-sm text-smile hover:border-smile"
            >
              {person.username}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4">
        <Link href="/submit" className="text-sm text-mute underline hover:text-paper">
          Share a moment
        </Link>
        <InviteNight className="text-sm text-mute underline hover:text-paper" />
      </div>
    </section>
  );
}
