export function NightBuddy({
  play = "loop",
  className = "h-28 w-28",
}: {
  play?: "loop" | "once";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 248"
      className={`buddy buddy-${play} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="buddy-shade" cx="42%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="55%" stopColor="#141414" />
          <stop offset="100%" stopColor="#0c0c0c" />
        </radialGradient>
      </defs>

      <ellipse
        className="buddy-shadow"
        cx="100"
        cy="232"
        rx="46"
        ry="7"
        fill="#000"
      />

      <g className="buddy-float">
        <g className="buddy-squash">
          <path
            className="buddy-sticker"
            d="M100 16c40.2 0 74 32.4 76 76.2 1.2 27.6-13.2 51.4-36.8 64.2 6.4 9.4 12.2 26.8 4.4 39.4-7.6 12.4-25.8 22.2-43.6 22.2s-36-9.8-43.6-22.2c-7.8-12.6-2-30 4.4-39.4C39.2 143.6 24.8 119.8 26 92.2 28 48.4 59.8 16 100 16z"
            fill="#f4efe6"
          />
          <path
            d="M100 28c34.4 0 62.4 27.2 64 64.6 1 23.4-11.4 43.6-31.4 54.4 5.4 8 10.2 22.4 3.6 32.8-6.4 10.2-21.6 18.4-36.2 18.4s-29.8-8.2-36.2-18.4c-6.6-10.4-1.8-24.8 3.6-32.8-20-10.8-32.4-31-31.4-54.4C37.6 55.2 65.6 28 100 28z"
            fill="url(#buddy-shade)"
          />

          <g className="buddy-face">
            <g className="buddy-wink">
              <path
                d="M54 96c8.4-12.2 26.8-13.4 36.6 1.2"
                stroke="#e2b441"
                strokeWidth="6.4"
                strokeLinecap="round"
              />
            </g>

            <g className="buddy-open-eye">
              <ellipse
                cx="132"
                cy="96"
                rx="11.4"
                ry="15.2"
                fill="#e2b441"
                transform="rotate(-18 132 96)"
              />
              <ellipse
                className="buddy-shine"
                cx="136"
                cy="90"
                rx="3.4"
                ry="4.8"
                fill="#fff6d4"
                transform="rotate(-18 136 90)"
              />
            </g>

            <path
              className="buddy-mouth"
              d="M72 126q28 26 56 0"
              stroke="#e2b441"
              strokeWidth="6.2"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
