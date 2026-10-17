import type { ReactNode } from "react";
import { HoodDesk, HoodFace } from "@/components/mascot/Hood";

export type HoodMotionKind = "loading" | "success" | "empty" | "error" | "enter";

const LABELS: Record<HoodMotionKind, string> = {
  loading: "작업 진행 중",
  success: "완료",
  empty: "",
  error: "오류",
  enter: "",
};

export function HoodMotion({
  kind,
  size = 64,
  pose,
}: {
  kind: HoodMotionKind;
  size?: number;
  pose?: "face" | "desk";
}) {
  const useDesk = pose ? pose === "desk" : kind === "empty" || kind === "error";
  const label = LABELS[kind];
  return (
    <div className={`hood-motion is-${kind}`} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      {useDesk ? <HoodDesk size={size} /> : <HoodFace size={size} />}
      <span className="hood-dots" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {kind === "success" ? (
        <span className="hood-check" aria-hidden>
          ✓
        </span>
      ) : null}
    </div>
  );
}

export function HoodEmpty({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="hood-empty">
      <HoodMotion kind="empty" size={140} />
      <h2 className="hood-empty-title">{title}</h2>
      {children ? <div className="lede">{children}</div> : null}
      {action ? <div className="hero-actions">{action}</div> : null}
    </div>
  );
}
