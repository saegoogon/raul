import { useEffect, useRef } from "react";
import type { CharacterState } from "@shared/types";
import { createPose, damp, layered, poseBias, rangeRand, wave, type LivePose } from "./pose";

type Gaze = { x: number; y: number; until: number };
type Blink = { until: number; double: boolean; phase: "open" | "closing" | "shut" | "opening" | "gap" };

const GAZE_PRESETS: [number, number][] = [
  [0, 0],
  [0.18, -0.06],
  [-0.22, 0.04],
  [0.32, 0.1],
  [-0.12, -0.14],
  [0.08, 0.16],
];

export function useLiveCharacter(state: CharacterState, reduce: boolean) {
  const pose = useRef<LivePose>(createPose());
  const gaze = useRef<Gaze>({ x: 0, y: 0, until: 0 });
  const blink = useRef<Blink>({ until: 1.5, double: false, phase: "open" });
  const thinkPick = useRef(0);
  const prevState = useRef(state);
  const last = useRef(0);

  useEffect(() => {
    if (state === "thinking" && prevState.current !== "thinking") {
      thinkPick.current = Math.floor(Math.random() * 3);
    }
    prevState.current = state;
  }, [state]);

  const tick = (elapsed: number) => {
    const dt = Math.min(0.05, last.current ? elapsed - last.current : 0.016);
    last.current = elapsed;
    const p = pose.current;
    const bias = poseBias(state);
    const still = reduce ? 0.18 : 1;
    const t = elapsed;

    if (t > gaze.current.until) {
      const pick = GAZE_PRESETS[Math.floor(Math.random() * GAZE_PRESETS.length)];
      gaze.current = {
        x: pick[0],
        y: pick[1],
        until: t + rangeRand(1.6, 4.2),
      };
    }

    const b = blink.current;
    if (b.phase === "open" && t > b.until) {
      b.phase = "closing";
      b.double = Math.random() < 0.22;
      b.until = t + 0.045;
    } else if (b.phase === "closing" && t > b.until) {
      b.phase = "shut";
      b.until = t + 0.05;
    } else if (b.phase === "shut" && t > b.until) {
      b.phase = "opening";
      b.until = t + 0.07;
    } else if (b.phase === "opening" && t > b.until) {
      if (b.double) {
        b.phase = "gap";
        b.double = false;
        b.until = t + 0.09;
      } else {
        b.phase = "open";
        b.until = t + rangeRand(2.6, 6.1);
      }
    } else if (b.phase === "gap" && t > b.until) {
      b.phase = "closing";
      b.until = t + 0.04;
    }

    const blinkAmt = state === "sleeping" ? 1 : b.phase === "shut" ? 1 : b.phase === "closing" || b.phase === "opening" ? 0.85 : 0;

    let gazeX = gaze.current.x;
    let gazeY = gaze.current.y;
    let headRoll = (bias.headRoll ?? 0) * still;
    let headYaw = 0;
    if (state === "listening" || state === "talking") {
      gazeX = 0;
      gazeY = 0.04;
    } else if (state === "thinking") {
      const v = thinkPick.current;
      gazeX = v === 0 ? 0.42 : v === 1 ? -0.28 : 0.12;
      gazeY = v === 2 ? 0.18 : -0.08;
      headRoll = v === 1 ? -0.1 : 0.09;
      headYaw = v === 0 ? 0.08 : -0.05;
    }

    const breath = reduce ? wave(t, 1.1, 0.006) : wave(t, 1.35, 0.018) + wave(t, 0.47, 0.006, 1.2);
    const talk =
      state === "talking"
        ? Math.abs(layered(t * 9.3, 1, 1.73)) * 0.55 + Math.abs(Math.sin(t * 17.1)) * 0.2
        : 0;

    p.breath = damp(p.breath, breath, 6, dt);
    p.blinkL = damp(p.blinkL, blinkAmt, 28, dt);
    p.blinkR = damp(p.blinkR, blinkAmt, 26, dt);
    p.gazeX = damp(p.gazeX, gazeX * still, 4.2, dt);
    p.gazeY = damp(p.gazeY, gazeY * still, 4.2, dt);
    p.headYaw = damp(p.headYaw, (headYaw + layered(t, 0.31, 0.73) * 0.025 * still) + (bias.headYaw ?? 0), 3.5, dt);
    p.headPitch = damp(
      p.headPitch,
      (bias.headPitch ?? 0) + p.breath * 0.35 + layered(t, 0.27, 0.61) * 0.02 * still,
      3.2,
      dt,
    );
    p.headRoll = damp(p.headRoll, headRoll + layered(t, 0.23, 0.51) * 0.015 * still, 3.2, dt);
    p.bodySway = damp(p.bodySway, layered(t, 0.21, 0.43) * 0.012 * still, 2.4, dt);
    p.lean = damp(p.lean, (bias.lean ?? 0) * still, 3, dt);
    p.smile = damp(p.smile, bias.smile ?? 0.12, 5, dt);
    p.brow = damp(p.brow, bias.brow ?? 0, 6, dt);
    p.mouthOpen = damp(p.mouthOpen, talk || (bias.mouthOpen ?? 0.04), talk ? 14 : 7, dt);
    p.mouthWide = damp(p.mouthWide, bias.mouthWide ?? talk * 0.25, 8, dt);
    p.bounce = damp(p.bounce, (bias.bounce ?? 0) * (reduce ? 0 : 1), 8, dt);
    p.camX = damp(p.camX, reduce ? 0 : layered(t, 0.11, 0.19) * 0.04, 1.2, dt);
    p.camY = damp(p.camY, (bias.camY ?? 0.22) + (reduce ? 0 : wave(t, 0.17, 0.012)), 1.4, dt);
    p.camZ = damp(p.camZ, bias.camZ ?? 2.32, 1.6, dt);
    p.hairLag = damp(p.hairLag, p.headYaw, 2.1, dt);
    return p;
  };

  return { pose, tick };
}
