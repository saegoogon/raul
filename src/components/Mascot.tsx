import Image from "next/image";

const sizes = {
  xs: 28,
  sm: 40,
  md: 92,
  lg: 132,
  xl: 176,
} as const;

export function Mascot({
  size = "md",
  bob = false,
  kind = "character",
  className = "",
  priority = false,
}: {
  size?: keyof typeof sizes;
  bob?: boolean;
  kind?: "character" | "logo";
  className?: string;
  priority?: boolean;
}) {
  const px = sizes[size];

  return (
    <Image
      src={
        kind === "logo"
          ? "/brand/blacksmile-logo.png"
          : "/brand/blacksmile-character.png"
      }
      alt=""
      width={px}
      height={px}
      priority={priority}
      className={`pointer-events-none select-none object-contain ${
        bob ? "mascot-bob" : ""
      } ${className}`}
    />
  );
}
