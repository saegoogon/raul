"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/BrandMark";
import { Icon, type IconName } from "@/components/drive/Icon";
import { QUOTA_BYTES, formatBytes } from "@/lib/drive";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/drive", label: "My Drive", icon: "home" },
  { href: "/drive/recent", label: "Recent", icon: "clock" },
  { href: "/drive/trash", label: "Trash", icon: "trash" },
];

export function DriveShell({
  used,
  name,
  children,
}: {
  used: number;
  name: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const percent = Math.min(100, (used / QUOTA_BYTES) * 100);

  const active = (href: string) =>
    href === "/drive"
      ? pathname === "/drive" || pathname.startsWith("/drive/f/")
      : pathname.startsWith(href);

  return (
    <div className="flex min-h-dvh">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-night px-3 py-4 transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/drive" className="mb-6 flex items-center gap-2 px-3" onClick={() => setOpen(false)}>
          <Icon name="cloud" size={22} filled />
          <span className="text-lg font-semibold tracking-tight">
            <BrandMark /> <span className="text-mute">Cloud</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm transition-colors ${
                active(item.href) ? "bg-paper text-night" : "text-paper hover:bg-ink"
              }`}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-ink">
            <div className="h-full rounded-full bg-paper" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-mute">
            {formatBytes(used)} of {formatBytes(QUOTA_BYTES)} used
          </p>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-night/90 px-3 backdrop-blur md:px-6">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-full p-2 hover:bg-ink md:hidden"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccount((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-sm font-semibold uppercase text-night"
              aria-label="Account"
            >
              {name.slice(0, 1)}
            </button>
            {account ? (
              <div className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-line bg-ink p-2 shadow-2xl">
                <p className="truncate px-3 py-2 text-sm">{name}</p>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-mute hover:bg-night hover:text-paper"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
