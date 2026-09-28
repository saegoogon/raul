"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function BottomNav() {
  const pathname = usePathname();
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setMe(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();
      setMe(profile?.username ?? null);
    });
  }, []);

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
        {item("/", "Night", pathname === "/")}
        {item("/submit", "Share", pathname === "/submit")}
        {item(me ? `/u/${me}` : "/login", "Me", pathname.startsWith("/u/"))}
      </div>
    </nav>
  );
}
