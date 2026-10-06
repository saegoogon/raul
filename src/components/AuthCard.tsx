import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Logo } from "@/components/Icon";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col px-6 py-6 md:px-10">
      <Link href="/" className="flex items-center gap-2 text-sm">
        <Logo size={20} />
        <BrandMark />
      </Link>
      <div className="mx-auto flex w-full max-w-xs flex-1 flex-col justify-center py-16">
        <h1 className="mb-8 text-lg font-medium">{title}</h1>
        <div className="flex flex-col gap-5">{children}</div>
        <p className="mt-8 text-sm text-mute">{footer}</p>
      </div>
    </div>
  );
}
