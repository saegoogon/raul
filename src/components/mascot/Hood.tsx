function Spark({
  x,
  y,
  size = 10,
  fill = "#fff",
}: {
  x: number;
  y: number;
  size?: number;
  fill?: string;
}) {
  const b = size * 0.16;
  return (
    <path
      fill={fill}
      d={`M${x} ${y - size} L${x + b} ${y - b} L${x + size} ${y} L${x + b} ${y + b} L${x} ${y + size} L${x - b} ${y + b} L${x - size} ${y} L${x - b} ${y - b} Z`}
    />
  );
}

export function HoodFace({
  size = 32,
  background = false,
}: {
  size?: number;
  background?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      {background ? <rect width="64" height="64" rx="14" fill="#000" /> : null}
      <path
        fill="#fff"
        d="M32 5.6C24.2 5.6 16.6 12.8 15.8 24.8 15 36.4 20.8 46.6 32 49.2 43.2 46.6 49 36.4 48.2 24.8 47.4 12.8 39.8 5.6 32 5.6Z"
      />
      <circle cx="25.2" cy="29.4" r="2.4" fill="#0a0a0a" />
      <circle cx="38.8" cy="29.4" r="2.4" fill="#0a0a0a" />
      <path
        d="M26 36.6c2.4 3.4 9.6 3.4 12 0"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Spark x={53.2} y={12.4} size={7.4} />
    </svg>
  );
}

export function HoodDesk({ size = 120 }: { size?: number }) {
  const height = Math.round(size * 0.86);
  return (
    <svg width={size} height={height} viewBox="0 0 120 104" aria-hidden>
      <path
        d="M16 68C3 36 30 2 94 17"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        fill="#fff"
        d="M60 6C46.4 6 35.2 17.6 34.4 34.2 33.8 47.2 44 60.4 60 63.2 76 60.4 86.2 47.2 85.6 34.2 84.8 17.6 73.6 6 60 6Z"
      />
      <path
        fill="#fff"
        d="M33.6 64.2c-8.2 1.6-14.8 7.2-14.8 13.4 0 7.6 13.6 13.4 41.2 13.4s41.2-5.8 41.2-13.4c0-6.2-6.6-11.8-14.8-13.4Z"
      />
      <circle cx="51.2" cy="36.8" r="3.05" fill="#0a0a0a" />
      <circle cx="68.8" cy="36.8" r="3.05" fill="#0a0a0a" />
      <path
        d="M52.4 45.8c2.7 3.8 12.5 3.8 15.2 0"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="36" y="69" width="48" height="20" rx="5" fill="#fff" />
      <path d="M40 77.2h40" fill="none" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" />
      <Spark x={60} y={73.4} size={3.8} fill="#0a0a0a" />
      <Spark x={99} y={15} size={8.4} />
    </svg>
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
