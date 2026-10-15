import type { ReactNode } from "react";
import { HoodFace } from "@/components/mascot/Hood";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="page-pad">
      <div className="brutal-box mx-auto flex w-full max-w-sm flex-col p-6">
        <HoodFace size={40} />
        <h1 className="mb-8 mt-4 text-lg font-medium">
          {title}
          <span className="caret" aria-hidden />
        </h1>
        <div className="flex flex-col gap-5">{children}</div>
        <p className="mt-8 text-sm text-mute">{footer}</p>
      </div>
    </div>
  );
}
