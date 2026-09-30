import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/drive/Icon";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <Icon name="cloud" size={24} filled />
          <BrandMark /> <span className="text-mute">Cloud</span>
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
