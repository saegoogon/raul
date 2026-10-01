import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Logo } from "@/components/Icon";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 font-semibold">
          <Logo size={24} />
          <BrandMark /> <span className="text-mute">Links</span>
        </Link>
        <div className="surface flex flex-col gap-4 p-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          {children}
        </div>
        <p className="mt-5 text-center text-sm text-mute">{footer}</p>
      </div>
    </div>
  );
}
