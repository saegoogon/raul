import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { InviteNight } from "@/components/InviteNight";
import { SmileMark } from "@/components/SmileMark";

export function GuestHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-ink px-6 py-10 sm:px-10 sm:py-14">
      <SmileMark className="h-12 w-12 text-smile" wink="once" />
      <p className="mt-5 text-sm font-semibold">
        <BrandMark />
      </p>
      <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
        어둠 속의
        <br />
        미소.
      </h1>
      <p className="mt-5 max-w-lg text-sm text-mute">
        팔로우 없이, 오늘 밤만. 24시간이 지나면 사라져요.
        <br />
        No follow. One night only.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-smile px-5 py-2 text-sm font-semibold text-night hover:bg-amber-200"
        >
          무료로 시작
        </Link>
        <InviteNight className="rounded-full border border-line px-5 py-2 text-sm text-paper hover:border-mute" />
      </div>
    </section>
  );
}
