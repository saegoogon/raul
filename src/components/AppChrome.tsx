"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const game = pathname === "/" || pathname.startsWith("/play") || pathname.startsWith("/shop");

  if (game) {
    return <Providers>{children}</Providers>;
  }

  return (
    <Providers>
      <div className="auth-shell">
        <a href="/" className="auth-back">
          Title
        </a>
        <main className="mx-auto w-full max-w-sm flex-1 px-4 py-8">{children}</main>
      </div>
    </Providers>
  );
}
