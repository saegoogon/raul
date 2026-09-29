"use client";

import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Mascot } from "@/components/Mascot";
import { useAuth } from "@/components/Providers";
import { signOut } from "@/actions/auth";

export function Header() {
  const { userId, username } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-line/80 bg-night/80 text-paper backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <a
          href="/"
          className="blacksmile-logo flex items-center gap-2 text-base"
          onClick={(event) => {
            event.preventDefault();
            window.location.href = "/";
          }}
        >
          <Mascot size="xs" />
          <BrandMark />
        </a>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/play" className="btn-primary px-3 py-1.5 text-sm">
            Play
          </Link>
          <Link href="/rank" className="text-mute hover:text-paper">
            Rank
          </Link>
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
              <Link href="/signup" prefetch className="text-mute hover:text-paper">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
