"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SmileMark } from "@/components/SmileMark";
import { useAuth } from "@/components/Providers";
import { signOut } from "@/actions/auth";

export function Header() {
  const { userId, username } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-night text-paper">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-3">
        <a
          href="/"
          className="blacksmile-logo flex items-center gap-2 text-base"
          onClick={(event) => {
            event.preventDefault();
            window.location.href = "/";
          }}
        >
          <SmileMark className="h-5 w-5 text-smile" wink="hover" />
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
                className="border border-smile bg-smile px-3 py-1 text-night"
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
                className="border border-smile bg-smile px-3 py-1 text-night"
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
