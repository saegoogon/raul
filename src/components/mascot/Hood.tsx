export function HoodFace({
  size = 32,
  background: _background = false,
}: {
  size?: number;
  background?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/favicon.png" width={size} height={size} alt="" aria-hidden className="hood-face" />
  );
}

export function HoodDesk({ size = 120 }: { size?: number }) {
  const height = Math.round(size * 0.78);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/hood.png" width={size} height={height} alt="" aria-hidden className="hood-desk" />
  );
}

export function Hood({
  size = 48,
  caption,
  variant = "desk",
}: {
  size?: number;
  caption?: string;
  variant?: "face" | "desk";
}) {
  return (
    <figure className="hood-mascot">
      {variant === "face" ? <HoodFace size={size} /> : <HoodDesk size={size} />}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
