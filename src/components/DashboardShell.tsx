"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/BrandMark";
import { Icon, Logo, type IconName } from "@/components/Icon";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Links", icon: "link" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "chart" },
  { href: "/dashboard/page", label: "My page", icon: "user" },
];

export function DashboardShell({
  username,
  email,
  children,
}: {
  username: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);

  useEffect(() => {
    if (!account) return;
    const close = () => setAccount(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [account]);

  const active = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="flex min-h-dvh">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-night px-3 py-4 transition-transform md:sticky md:top-0 md:h-dvh md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/dashboard" className="mb-7 flex items-center gap-2.5 px-3" onClick={() => setOpen(false)}>
          <Logo />
          <span className="font-semibold tracking-tight">
            <BrandMark /> <span className="text-mute">Links</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                active(item.href) ? "bg-ink font-medium text-paper" : "text-mute hover:bg-ink hover:text-paper"
              }`}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {username ? (
          <a
            href={`/@${username}`}
            target="_blank"
            rel="noopener"
            className="mt-auto flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2.5 text-sm hover:border-mute"
          >
            <span className="truncate">blacksmile.co.kr/@{username}</span>
            <Icon name="external" size={16} className="shrink-0 text-mute" />
          </a>
        ) : null}
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
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-night/90 px-3 backdrop-blur md:px-8">
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
              onClick={(event) => {
                event.stopPropagation();
                setAccount((value) => !value);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-sm font-semibold uppercase text-night"
              aria-label="Account"
              aria-expanded={account}
            >
              {(username || email).slice(0, 1)}
            </button>
            {account ? (
              <div
                className="absolute right-0 top-11 z-30 w-60 rounded-2xl border border-line bg-ink p-2 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">@{username}</p>
                  <p className="truncate text-xs text-mute">{email}</p>
                </div>
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
        <main className="mx-auto flex w-full max-w-5xl min-w-0 flex-1 flex-col px-4 pb-20 pt-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
