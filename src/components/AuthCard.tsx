import type { ReactNode } from "react";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="page-pad">
      <div className="mx-auto flex w-full max-w-xs flex-col py-10">
        <h1 className="mb-8 text-lg font-medium">{title}</h1>
        <div className="flex flex-col gap-5">{children}</div>
        <p className="mt-8 text-sm text-mute">{footer}</p>
      </div>
    </div>
  );
}
