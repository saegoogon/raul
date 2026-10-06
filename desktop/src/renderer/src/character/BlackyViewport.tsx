import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { CharacterState } from "@shared/types";
import { BlackyCharacter } from "./BlackyCharacter";

const CAPTION: Partial<Record<CharacterState, string>> = {
  idle: "무엇을 도와줄까?",
  thinking: "잠깐만…",
  listening: "듣고 있어.",
  talking: "",
  happy: "",
  confused: "음…",
  sleeping: "z z z",
  error: "뭔가 꼬였어.",
  typing: "적어 가는 중.",
  surprised: "오.",
};

export function BlackyViewport({
  state,
  reduceMotion,
  compact = false,
  fill = false,
  silent = false,
  line,
}: {
  state: CharacterState;
  reduceMotion: boolean;
  compact?: boolean;
  fill?: boolean;
  silent?: boolean;
  line?: string;
}) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const caption = compact || silent ? null : (line ?? CAPTION[state] ?? "");
  const height = compact ? "100%" : fill ? "100%" : "220px";

  return (
    <div className="flex h-full flex-col items-stretch">
      <div className="min-h-0 w-full flex-1" style={{ height, minHeight: compact ? 160 : undefined }}>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={hidden ? "demand" : "always"}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false }}
          camera={{ fov: compact ? 30 : 26, position: [0, 0.22, 2.32], near: 0.1, far: 16 }}
          style={compact ? { pointerEvents: "none" } : undefined}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>
            <BlackyCharacter state={state} reduceMotion={reduceMotion} compact={compact} />
          </Suspense>
        </Canvas>
      </div>
      {caption ? <p className="voice">{caption}</p> : null}
    </div>
  );
}
