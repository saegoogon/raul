import Image from "next/image";
import { NightBuddy } from "@/components/NightBuddy";

const logoClass = {
  xs: "h-7 w-7",
  sm: "h-10 w-10",
} as const;

const bodyPx = {
  md: 120,
  lg: 168,
  xl: 240,
} as const;

const poses = {
  stand: "/brand/blacksmile-character.png",
  sit: "/brand/blacksmile-hero.png",
  wait: "/brand/blacksmile-wait.png",
  sleep: "/brand/blacksmile-sleep.png",
} as const;

export function Mascot({
  size = "md",
  bob = false,
  pose = "stand",
  priority = false,
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  bob?: boolean;
  pose?: keyof typeof poses;
  priority?: boolean;
  className?: string;
}) {
  if (size === "xs" || size === "sm") {
    return (
      <NightBuddy
        play={bob ? "loop" : undefined}
        className={`${logoClass[size]} ${className}`}
      />
    );
  }

  const px = bodyPx[size];
  return (
    <Image
      src={poses[pose]}
      alt=""
      width={px}
      height={px}
      priority={priority}
      className={`buddy ${bob ? "buddy-loop" : ""} ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
