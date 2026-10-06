import type { CharacterState } from "@shared/types";

export type LivePose = {
  breath: number;
  blinkL: number;
  blinkR: number;
  gazeX: number;
  gazeY: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
  bodySway: number;
  lean: number;
  smile: number;
  brow: number;
  mouthOpen: number;
  mouthWide: number;
  bounce: number;
  camX: number;
  camY: number;
  camZ: number;
  hairLag: number;
};

const ZERO: LivePose = {
  breath: 0,
  blinkL: 0,
  blinkR: 0,
  gazeX: 0,
  gazeY: 0,
  headYaw: 0,
  headPitch: 0,
  headRoll: 0,
  bodySway: 0,
  lean: 0,
  smile: 0.12,
  brow: 0,
  mouthOpen: 0.04,
  mouthWide: 0,
  bounce: 0,
  camX: 0,
  camY: 0.22,
  camZ: 2.32,
  hairLag: 0,
};

type Bias = Partial<LivePose> & { thinkVariant?: number };

const BIAS: Record<CharacterState, Bias> = {
  idle: { smile: 0.12, camZ: 2.32 },
  thinking: { brow: 0.45, smile: 0, mouthOpen: 0, lean: 0.02, camZ: 2.18 },
  listening: { lean: 0.05, smile: 0.08, gazeY: 0.04, camZ: 2.22 },
  typing: { brow: 0.25, smile: 0.05, camZ: 2.2 },
  talking: { smile: 0.22, lean: 0.02, camY: 0.24 },
  happy: { smile: 1, brow: -0.2, bounce: 0.04, camY: 0.28 },
  confused: { brow: 0.55, headRoll: 0.12, smile: 0, gazeX: 0.22 },
  surprised: { brow: -0.35, mouthOpen: 0.55, mouthWide: 0.4, bounce: 0.03, camZ: 2.12 },
  error: { brow: 0.4, smile: -0.2, headPitch: 0.06 },
  sleeping: { smile: 0, headPitch: 0.18, blinkL: 1, blinkR: 1, camY: 0.18 },
};

export function poseBias(state: CharacterState): Bias {
  return BIAS[state] ?? BIAS.idle;
}

export function createPose(): LivePose {
  return { ...ZERO };
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function wave(t: number, speed: number, amp: number, phase = 0) {
  return Math.sin(t * speed + phase) * amp;
}

export function layered(t: number, a: number, b: number) {
  return Math.sin(t * a) * 0.55 + Math.sin(t * b + 1.7) * 0.3 + Math.sin(t * (a * 0.37) + 4.1) * 0.15;
}

export function rangeRand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
