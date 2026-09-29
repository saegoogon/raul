import { NightBuddy } from "@/components/NightBuddy";

const sizes = {
  xs: "h-7 w-7",
  sm: "h-10 w-10",
  md: "h-[92px] w-[92px]",
  lg: "h-[132px] w-[132px]",
  xl: "h-[176px] w-[176px]",
} as const;

export function Mascot({
  size = "md",
  bob = false,
  className = "",
}: {
  size?: keyof typeof sizes;
  bob?: boolean;
  className?: string;
}) {
  return (
    <NightBuddy
      play={bob ? "loop" : undefined}
      className={`${sizes[size]} ${className}`}
    />
  );
}
