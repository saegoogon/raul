import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { tonightPrompt } from "@/lib/night";
import type { Profile } from "@/lib/types";

export function NightRoom({ people }: { people: Profile[] }) {
  const prompt = tonightPrompt();

  return (
    <section className="rounded-2xl bg-zinc-950 px-5 py-5 text-white">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-300">
        :) tonight
      </p>
      <h2 className="mt-1 text-lg font-bold">Tonight&apos;s prompt</h2>
      <p className="mt-2 text-xl font-medium tracking-tight">{prompt.en}</p>
      <p className="mt-1 text-sm text-zinc-400">{prompt.ko}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/submit"
          className="rounded-full bg-amber-300 px-4 py-1.5 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
        >
          Answer tonight
        </Link>
        <ShareButton
          path="/"
          title="blacksmile"
          text="A smile in the dark. Tonight at blacksmile — no follow."
          dark
          label="Invite"
        />
      </div>

      <h3 className="mt-6 text-sm font-semibold">Faces in the dark</h3>
      <p className="mt-1 text-sm text-zinc-400">
        No follow. Leave a black smile, or pass a moment on.
      </p>

      {people.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          The dark is still empty. Answer the prompt and open the room.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
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
