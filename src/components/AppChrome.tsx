"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { BrandMark } from "@/components/BrandMark";
import { Header } from "@/components/Header";
import { Mascot } from "@/components/Mascot";
import { Providers } from "@/components/Providers";
import { WinkIntro } from "@/components/WinkIntro";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const play = pathname.startsWith("/play");

  if (play) {
    return <Providers>{children}</Providers>;
  }

  return (
    <Providers>
      <WinkIntro />
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav />
      <footer className="border-t border-line/80 py-8 text-center text-xs text-mute">
        <Mascot size="sm" className="mx-auto" />
        <p className="mt-2 text-sm">
          <BrandMark />
        </p>
        <p className="mt-1">More fun together</p>
      </footer>
    </Providers>
  );
}
