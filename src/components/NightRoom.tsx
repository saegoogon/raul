import Link from "next/link";
import { DarkPresence } from "@/components/DarkPresence";
import type { Profile } from "@/lib/types";

export function NightRoom({ people }: { people: Profile[] }) {
  return (
    <section className="rounded-2xl border border-line bg-ink px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-smile">
        tonight
      </p>
      <h2 className="font-display mt-1 text-2xl italic">Faces in the dark</h2>
      <p className="mt-1 text-sm text-mute">
        No follow. One night only. Then it&apos;s gone.
        <br />
        팔로우 없이, 24시간이 지나면 사라져요.
      </p>
      <DarkPresence />

      {people.length === 0 ? (
        <p className="mt-4 text-sm text-mute">
          The dark is still empty. Share and someone may smile back.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/u/${person.username}`}
              className="rounded-full bg-night px-3 py-1 text-sm text-smile hover:bg-line"
            >
              {person.username}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
