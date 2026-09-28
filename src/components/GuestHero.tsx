import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SmileMark } from "@/components/SmileMark";

export function GuestHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-ink px-6 py-10 sm:px-10 sm:py-14">
      <SmileMark className="h-12 w-12 text-smile" />
      <p className="mt-5 text-sm font-semibold">
        <BrandMark />
      </p>
      <h1 className="font-display mt-3 text-4xl italic leading-[1.05] tracking-tight sm:text-6xl">
        A smile
        <br />
        in the dark.
      </h1>
      <p className="mt-5 max-w-lg text-sm text-mute">
        No follow. One night only. Then the dark takes it.
        <br />
        팔로우 없이, 24시간이 지나면 사라져요.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-smile px-5 py-2 text-sm font-semibold text-night hover:bg-amber-200"
        >
          Join free
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-line px-5 py-2 text-sm text-paper hover:border-mute"
        >
          Log in
        </Link>
      </div>
    </section>
  );
}
