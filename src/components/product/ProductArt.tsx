type Props = { id: string; className?: string };

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 400 500" className={className ?? "h-full w-full"} aria-hidden>
      <rect width="400" height="500" fill="#111110" />
      {children}
    </svg>
  );
}

function Grin({ cx, cy, w = 72, yellow = false }: { cx: number; cy: number; w?: number; yellow?: boolean }) {
  const color = yellow ? "#f2d84a" : "#ecece8";
  return (
    <g fill="none" stroke={color} strokeWidth="6" strokeLinecap="round">
      <circle cx={cx - w * 0.28} cy={cy - 8} r="4" fill={color} stroke="none" />
      <circle cx={cx + w * 0.28} cy={cy - 8} r="4" fill={color} stroke="none" />
      <path d={`M ${cx - w * 0.38} ${cy + 10} C ${cx - w * 0.1} ${cy + 28}, ${cx + w * 0.1} ${cy + 28}, ${cx + w * 0.38} ${cy + 10}`} />
    </g>
  );
}

export function ProductArt({ id, className }: Props) {
  switch (id) {
    case "tee-a":
      return (
        <Frame className={className}>
          <path d="M90 150 L140 130 L160 170 L240 170 L260 130 L310 150 L300 390 L100 390 Z" fill="#1c1c1b" />
          <Grin cx={200} cy={250} />
        </Frame>
      );
    case "tee-b":
      return (
        <Frame className={className}>
          <path d="M90 150 L140 130 L160 170 L240 170 L260 130 L310 150 L300 390 L100 390 Z" fill="#1c1c1b" />
          <Grin cx={200} cy={258} w={96} yellow />
        </Frame>
      );
    case "hood-a":
      return (
        <Frame className={className}>
          <path d="M120 120 Q200 70 280 120 L300 400 L100 400 Z" fill="#171716" />
          <path d="M150 130 Q200 100 250 130" fill="none" stroke="#2a2a28" strokeWidth="10" />
          <path d="M168 250 C190 268 210 268 232 250" fill="none" stroke="#ecece8" strokeWidth="5" strokeLinecap="round" />
        </Frame>
      );
    case "hood-b":
      return (
        <Frame className={className}>
          <ellipse cx="200" cy="150" rx="78" ry="48" fill="#1a1a18" />
          <path d="M125 170 L275 170 L300 400 L100 400 Z" fill="#171716" />
          <Grin cx={200} cy={280} w={50} />
        </Frame>
      );
    case "cap-a":
      return (
        <Frame className={className}>
          <ellipse cx="200" cy="230" rx="110" ry="48" fill="#1a1a18" />
          <path d="M110 230 Q200 160 290 230" fill="#222220" />
        </Frame>
      );
    case "cap-b":
      return (
        <Frame className={className}>
          <ellipse cx="200" cy="250" rx="120" ry="20" fill="#1a1a18" />
          <path d="M80 250 Q200 210 320 250 Q200 280 80 250" fill="#222220" />
          <Grin cx={200} cy={248} w={40} yellow />
        </Frame>
      );
    case "socks-a":
      return (
        <Frame className={className}>
          <rect x="120" y="140" width="48" height="220" rx="8" fill="#1a1a18" />
          <rect x="176" y="160" width="48" height="220" rx="8" fill="#161615" />
          <rect x="232" y="150" width="48" height="220" rx="8" fill="#1d1d1b" />
        </Frame>
      );
    case "socks-b":
      return (
        <Frame className={className}>
          <rect x="176" y="140" width="56" height="240" rx="8" fill="#1a1a18" />
          <Grin cx={204} cy={320} w={28} yellow />
        </Frame>
      );
    case "lamp-a":
      return (
        <Frame className={className}>
          <rect x="188" y="280" width="24" height="120" fill="#2a2a28" />
          <ellipse cx="200" cy="430" rx="70" ry="10" fill="#0a0a0a" />
          <path d="M130 180 Q200 80 270 180 Z" fill="#1c1c1a" />
        </Frame>
      );
    case "lamp-b":
      return (
        <Frame className={className}>
          <rect x="188" y="280" width="24" height="120" fill="#2a2a28" />
          <path d="M130 180 Q200 80 270 180 Z" fill="#2a2710" />
          <Grin cx={200} cy={150} w={54} yellow />
        </Frame>
      );
    case "mug-a":
      return (
        <Frame className={className}>
          <rect x="140" y="160" width="120" height="160" rx="8" fill="#1b1b19" />
          <path d="M260 200 Q310 240 260 280" fill="none" stroke="#ecece8" strokeWidth="8" />
          <circle cx="175" cy="210" r="4" fill="#ecece8" />
          <circle cx="225" cy="210" r="4" fill="#ecece8" />
        </Frame>
      );
    case "mug-b":
      return (
        <Frame className={className}>
          <rect x="140" y="160" width="120" height="160" rx="8" fill="#1b1b19" />
          <rect x="148" y="168" width="104" height="70" fill="#2a2710" />
          <path d="M260 200 Q310 240 260 280" fill="none" stroke="#ecece8" strokeWidth="8" />
          <Grin cx={200} cy={250} w={48} yellow />
        </Frame>
      );
    case "pin-a":
      return (
        <Frame className={className}>
          <circle cx="200" cy="250" r="54" fill="#141413" stroke="#ecece8" strokeWidth="4" />
          <Grin cx={200} cy={252} w={48} />
        </Frame>
      );
    case "pin-b":
      return (
        <Frame className={className}>
          <rect x="80" y="160" width="240" height="200" fill="#171716" />
          <circle cx="250" cy="230" r="28" fill="#111" stroke="#f2d84a" strokeWidth="3" />
          <Grin cx={250} cy={232} w={22} yellow />
        </Frame>
      );
    case "tray-a":
      return (
        <Frame className={className}>
          <rect x="70" y="210" width="260" height="80" fill="#1a1a18" />
          <rect x="78" y="218" width="244" height="54" fill="#111110" />
        </Frame>
      );
    case "tray-b":
      return (
        <Frame className={className}>
          <rect x="70" y="210" width="260" height="80" fill="#1a1a18" />
          <rect x="78" y="218" width="244" height="54" fill="#111110" />
          <Grin cx={300} cy={244} w={22} yellow />
        </Frame>
      );
    case "poster-a":
      return (
        <Frame className={className}>
          <rect x="90" y="80" width="220" height="340" fill="#161614" />
          <path d="M120 160 L280 180 L250 300 L140 280 Z" fill="none" stroke="#3a3a36" strokeWidth="3" />
          <Grin cx={200} cy={230} w={40} />
        </Frame>
      );
    case "poster-b":
      return (
        <Frame className={className}>
          <rect x="90" y="80" width="220" height="340" fill="#161614" />
          <path d="M130 140 C220 160 160 250 270 300" fill="none" stroke="#f2d84a" strokeWidth="3" />
          <Grin cx={200} cy={330} w={36} />
        </Frame>
      );
    case "note-a":
      return (
        <Frame className={className}>
          <rect x="120" y="110" width="160" height="280" fill="#1c1c1a" />
          <rect x="120" y="110" width="14" height="280" fill="#2a2a26" />
        </Frame>
      );
    case "note-b":
      return (
        <Frame className={className}>
          <rect x="100" y="120" width="200" height="260" fill="#ecece8" />
          <path d="M120 170 H280 M120 200 H280 M120 230 H280 M120 260 H240" stroke="#c8c8c2" strokeWidth="2" />
          <Grin cx={250} cy={300} w={28} />
        </Frame>
      );
    case "stick-a":
      return (
        <Frame className={className}>
          {[0, 1, 2, 3].map((row) =>
            [0, 1].map((col) => (
              <g key={`${row}-${col}`} transform={`translate(${120 + col * 90} ${120 + row * 80})`}>
                <rect width="70" height="60" fill="#1a1a18" />
                <Grin cx={35} cy={32} w={28} />
              </g>
            )),
          )}
        </Frame>
      );
    case "stick-b":
      return (
        <Frame className={className}>
          <rect x="150" y="180" width="100" height="90" fill="#1a1a18" transform="rotate(-8 200 225)" />
          <g transform="translate(160 200) rotate(-8)">
            <Grin cx={40} cy={30} w={36} yellow />
          </g>
        </Frame>
      );
    case "mask-a":
      return (
        <Frame className={className}>
          <path d="M90 240 Q200 180 310 240 Q200 300 90 240" fill="#1a1a18" />
          <Grin cx={200} cy={240} w={70} />
        </Frame>
      );
    case "mask-b":
      return (
        <Frame className={className}>
          <path d="M90 240 Q200 180 310 240 Q200 300 90 240" fill="#141413" />
          <path d="M150 240 Q170 248 190 240" stroke="#ecece8" strokeWidth="3" fill="none" />
          <path d="M210 240 Q230 248 250 240" stroke="#ecece8" strokeWidth="3" fill="none" />
        </Frame>
      );
    case "incense-a":
      return (
        <Frame className={className}>
          <rect x="155" y="140" width="90" height="240" fill="#1b1b19" />
          <rect x="155" y="140" width="90" height="18" fill="#f2d84a" />
        </Frame>
      );
    case "incense-b":
      return (
        <Frame className={className}>
          <line x1="200" y1="360" x2="200" y2="180" stroke="#ecece8" strokeWidth="3" />
          <path d="M200 180 C220 140 180 120 210 90" fill="none" stroke="#f2d84a" strokeWidth="2" />
          <Grin cx={230} cy={100} w={24} yellow />
        </Frame>
      );
    case "cushion-a":
      return (
        <Frame className={className}>
          <ellipse cx="200" cy="280" rx="140" ry="70" fill="#1a1a18" />
          <ellipse cx="200" cy="268" rx="140" ry="70" fill="#222220" />
        </Frame>
      );
    case "cushion-b":
      return (
        <Frame className={className}>
          <ellipse cx="200" cy="280" rx="140" ry="70" fill="#1a1a18" />
          <ellipse cx="200" cy="268" rx="140" ry="70" fill="#222220" />
          <Grin cx={320} cy={268} w={28} />
        </Frame>
      );
    default:
      return (
        <Frame className={className}>
          <Grin cx={200} cy={250} />
        </Frame>
      );
  }
}
