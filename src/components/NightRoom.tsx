import Link from "next/link";
import type { Profile } from "@/lib/types";

export function NightRoom({ people }: { people: Profile[] }) {
  return (
    <section className="rounded-2xl bg-zinc-950 px-5 py-5 text-white">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-300">
        :) tonight
      </p>
      <h2 className="mt-1 text-lg font-bold">Faces in the dark</h2>
      <p className="mt-1 text-sm text-zinc-400">
        No follow. Leave a black smile on a moment. It fades by morning.
        <br />
        팔로우 없이, 오늘 밤의 순간에 검은 웃음만 남기세요.
      </p>

      {people.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          The dark is still empty. Share and someone may smile back.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/u/${person.username}`}
              className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-amber-200 hover:bg-zinc-700"
            >
              {person.username}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
