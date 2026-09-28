"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SmileMark } from "@/components/SmileMark";
import { useAuth } from "@/components/Providers";
import { signOut } from "@/actions/auth";

export function Header() {
  const { userId, username } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-night/90 text-paper backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a
          href="/"
          className="blacksmile-logo flex items-center gap-2 text-xl font-bold tracking-tight"
          onClick={(event) => {
            event.preventDefault();
            window.location.href = "/";
          }}
        >
          <SmileMark className="h-6 w-6 text-smile" wink="hover" />
          <BrandMark />
        </a>

        <nav className="flex items-center gap-3 text-sm">
          {userId ? (
            <>
              {username && (
                <Link
                  href={`/u/${username}`}
                  className="hidden text-mute hover:text-paper sm:inline"
                >
                  @{username}
                </Link>
              )}
              <Link
                href="/submit"
                className="rounded-full bg-smile px-4 py-1.5 font-medium text-night hover:bg-amber-200"
              >
                Share
              </Link>
              <form action={signOut}>
                <button type="submit" className="text-mute hover:text-paper">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-mute hover:text-paper">
                Log in
              </Link>
              <Link
                href="/signup"
                prefetch
                className="rounded-full bg-smile px-4 py-1.5 font-medium text-night hover:bg-amber-200"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
