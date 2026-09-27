import Link from "next/link";
import { signOut } from "@/actions/auth";
import type { User } from "@supabase/supabase-js";

export function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 text-white backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span aria-hidden className="text-amber-300">
            :)
          </span>
          blacksmile
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/submit"
                className="rounded-full bg-amber-300 px-4 py-1.5 font-medium text-zinc-950 hover:bg-amber-200"
              >
                Share
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-zinc-300 hover:text-white"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-300 hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-amber-300 px-4 py-1.5 font-medium text-zinc-950 hover:bg-amber-200"
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
