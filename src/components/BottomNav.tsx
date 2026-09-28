"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/Providers";

export function BottomNav() {
  const pathname = usePathname();
  const { username } = useAuth();

  const item = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center py-2 text-xs ${
        active ? "text-smile" : "text-mute"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-night text-paper md:hidden">
      <div className="mx-auto flex max-w-5xl">
        {item("/", "오늘 밤", pathname === "/")}
        {item("/submit", "올리기", pathname === "/submit")}
        {item(
          username ? `/u/${username}` : "/login",
          "나",
          pathname.startsWith("/u/"),
        )}
      </div>
    </nav>
  );
}
