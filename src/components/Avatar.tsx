import Image from "next/image";

export function Avatar({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/blacksmile-character.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-night object-cover ${className}`}
    />
  );
}
