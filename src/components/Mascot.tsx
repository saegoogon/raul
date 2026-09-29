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

export function Mascot({
  size = "md",
  bob = false,
  pose = "stand",
  priority = false,
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  bob?: boolean;
  pose?: "stand" | "sit";
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
      src={
        pose === "sit"
          ? "/brand/blacksmile-hero.png"
          : "/brand/blacksmile-character.png"
      }
      alt=""
      width={px}
      height={px}
      priority={priority}
      className={`buddy ${bob ? "buddy-loop" : ""} ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
