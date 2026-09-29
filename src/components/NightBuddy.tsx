import Image from "next/image";

export function NightBuddy({
  play,
  className = "h-10 w-10",
}: {
  play?: "loop" | "once";
  className?: string;
}) {
  return (
    <Image
      src="/brand/blacksmile-logo.png"
      alt=""
      width={80}
      height={80}
      className={`buddy ${play ? `buddy-${play}` : ""} ${className}`}
    />
  );
}
