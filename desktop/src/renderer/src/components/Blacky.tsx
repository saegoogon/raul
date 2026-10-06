import { motion, useReducedMotion } from "framer-motion";
import type { CharacterState } from "@shared/types";

const SAY: Record<CharacterState, string> = {
  idle: "무엇을 도와줄까?",
  thinking: "잠깐만…",
  listening: "듣고 있어.",
  typing: "적어 가는 중.",
  talking: "자, 이렇게 됐어.",
  happy: "좋아!",
  confused: "음… 다시 말해줄래?",
  surprised: "오!",
  error: "뭔가 꼬였어.",
  sleeping: "z z z",
};

export function Blacky({
  state,
  caption,
  compact = false,
}: {
  state: CharacterState;
  caption?: string;
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const size = compact ? 92 : 148;
  const talking = state === "talking" || state === "typing";
  const happy = state === "happy" || state === "surprised";
  const sleep = state === "sleeping";
  const err = state === "error";
  const think = state === "thinking";
  const listen = state === "listening";

  const bounce = reduce
    ? {}
    : {
        y: sleep ? 6 : happy ? [0, -8, 0] : think ? [0, -3, 0] : [0, -2, 0],
        rotate: err ? [-2, 2, -2] : 0,
      };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={bounce}
        transition={
          reduce
            ? { duration: 0 }
            : {
                duration: happy ? 0.55 : sleep ? 2.4 : 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg viewBox="0 0 120 120" width={size} height={size}>
          <circle cx="60" cy="62" r="46" fill="#111" stroke="#f4f4f4" strokeWidth="2.2" />
          <ellipse cx="60" cy="28" rx="22" ry="8" fill="#0a0a0a" />
          <Eye x={42} y={54} state={state} reduce={!!reduce} />
          <Eye x={78} y={54} state={state} reduce={!!reduce} />
          <motion.path
            d={mouth(state)}
            fill="none"
            stroke="#f4f4f4"
            strokeWidth="2.4"
            strokeLinecap="round"
            animate={talking && !reduce ? { d: [mouth("talking"), mouth("happy"), mouth("talking")] } : undefined}
            transition={{ duration: 0.35, repeat: Infinity }}
          />
          {think ? (
            <g fill="#f4f4f4">
              <circle cx="96" cy="28" r="3.2" />
              <circle cx="104" cy="18" r="2.2" />
            </g>
          ) : null}
          {listen ? <circle cx="60" cy="96" r="3" fill="#f4f4f4" opacity="0.8" /> : null}
        </svg>
      </motion.div>
      {compact ? null : (
        <p className="min-h-6 text-center text-sm text-mute">{caption ?? SAY[state]}</p>
      )}
    </div>
  );
}

function Eye({ x, y, state, reduce }: { x: number; y: number; state: CharacterState; reduce: boolean }) {
  const sleep = state === "sleeping";
  const confused = state === "confused";
  const look = reduce ? 0 : state === "listening" ? 3 : state === "thinking" ? -2 : 0;
  if (sleep) {
    return <path d={`M ${x - 8} ${y} Q ${x} ${y + 4} ${x + 8} ${y}`} stroke="#f4f4f4" strokeWidth="2.2" fill="none" />;
  }
  return (
    <g>
      <motion.circle
        cx={x + look}
        cy={y}
        r={confused ? 4.2 : 5.2}
        fill="#f4f4f4"
        animate={reduce ? undefined : { scaleY: [1, 1, 0.08, 1] }}
        transition={{ duration: 4.6, repeat: Infinity, times: [0, 0.86, 0.9, 1] }}
      />
      <circle cx={x + look} cy={y + 1} r="2.1" fill="#111" />
    </g>
  );
}

function mouth(state: CharacterState) {
  switch (state) {
    case "happy":
    case "surprised":
      return "M 46 78 Q 60 92 74 78";
    case "confused":
    case "error":
      return "M 48 82 Q 60 76 74 84";
    case "sleeping":
      return "M 50 82 Q 60 86 70 82";
    case "talking":
      return "M 52 78 Q 60 90 68 78";
    default:
      return "M 50 80 Q 60 86 70 80";
  }
}
