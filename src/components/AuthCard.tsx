import type { ReactNode } from "react";
import { HoodFace } from "@/components/mascot/Hood";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="page-pad">
      <div className="auth-panel">
        <HoodFace size={48} />
        <p className="kicker" style={{ marginTop: 20 }}>
          BlackSmile
        </p>
        <h1 className="mb-8 mt-2">{title}</h1>
        <div className="flex flex-col gap-5">{children}</div>
        <p className="mt-8 text-sm text-mute">{footer}</p>
      </div>
    </div>
  );
}
