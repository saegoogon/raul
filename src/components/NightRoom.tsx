import Link from "next/link";
import { DarkPresence } from "@/components/DarkPresence";
import { InviteNight } from "@/components/InviteNight";
import type { Profile } from "@/lib/types";

export function NightRoom({ people }: { people: Profile[] }) {
  return (
    <section className="rounded-2xl border border-line bg-ink px-5 py-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-smile">
        tonight
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">
        오늘 밤의 얼굴들
      </h2>
      <p className="mt-1 text-sm text-mute">
        팔로우 없이, 24시간이 지나면 사라져요.
        <br />
        No follow. One night only.
      </p>
      <DarkPresence />
      <InviteNight className="mt-4 text-sm font-medium text-smile hover:underline" />

      {people.length === 0 ? (
        <p className="mt-4 text-sm text-mute">
          아직 비어 있어요. 올리면 누군가 미소로 답할 수 있어요.
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
