import { NightBuddy } from "@/components/NightBuddy";

export function Avatar({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <NightBuddy className="h-full w-full" />
    </span>
  );
}
