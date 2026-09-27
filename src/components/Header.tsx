"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { signOut } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async (userId?: string) => {
      if (!userId) {
        setUsername(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();
      setUsername(data?.username ?? null);
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      void load(data.user?.id);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void load(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 text-white backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a
          href="/"
          className="flex items-center gap-2 text-xl font-bold"
          onClick={(event) => {
            event.preventDefault();
            window.location.href = "/";
          }}
        >
          <span aria-hidden className="text-amber-300">
            :)
          </span>
          <BrandMark />
        </a>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {username && (
                <Link
                  href={`/u/${username}`}
                  className="hidden text-zinc-300 hover:text-white sm:inline"
                >
                  @{username}
                </Link>
              )}
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
                prefetch
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
