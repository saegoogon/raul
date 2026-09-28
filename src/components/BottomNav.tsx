"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/Providers";

export function BottomNav() {
  const pathname = usePathname();
  const { username } = useAuth();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-20 rounded-3xl border border-line bg-night/90 text-paper shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-2xl items-center px-2 py-1">
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center rounded-2xl py-2 text-xs ${
            pathname === "/" ? "text-smile" : "text-mute"
          }`}
        >
          Night
        </Link>
        <Link
          href="/submit"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-smile text-sm text-night"
        >
          +
        </Link>
        <Link
          href={username ? `/u/${username}` : "/login"}
          className={`flex flex-1 flex-col items-center rounded-2xl py-2 text-xs ${
            pathname.startsWith("/u/") ? "text-smile" : "text-mute"
          }`}
        >
          Me
        </Link>
      </div>
    </nav>
  );
}
