import Link from "next/link";
import { DarkPresence } from "@/components/DarkPresence";
import { InviteNight } from "@/components/InviteNight";
import type { Profile } from "@/lib/types";

export function NightRoom({ people }: { people: Profile[] }) {
  return (
    <section className="border border-line bg-ink p-4">
      <h2 className="text-base">Here tonight</h2>
      <p className="mt-1 text-sm text-mute">Gone in 24 hours. No follow.</p>
      <DarkPresence />
      <InviteNight className="mt-3 text-sm text-smile underline" />

      {people.length === 0 ? (
        <p className="mt-3 text-sm text-mute">Nobody yet.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/u/${person.username}`}
              className="border border-line px-2 py-0.5 text-sm text-smile hover:border-smile"
            >
              {person.username}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
