import type { ReactNode } from "react";
import { HoodMotion } from "@/components/mascot/HoodMotion";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="page-pad">
      <div className="auth-panel">
        <HoodMotion kind="enter" size={48} pose="face" />
        <p className="kicker">BlackSmile</p>
        <h1 className="mb-8 mt-2">{title}</h1>
        <div className="flex flex-col gap-5">{children}</div>
        <p className="mt-8 text-sm text-mute">{footer}</p>
      </div>
    </div>
  );
}
