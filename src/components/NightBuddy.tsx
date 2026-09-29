export function NightBuddy({
  play,
  className = "h-28 w-28",
}: {
  play?: "loop" | "once";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`buddy ${play ? `buddy-${play}` : ""} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g className="buddy-float">
        <g className="buddy-squash">
          <path
            d="M32 8.1C46.6 7.5 55.9 16.9 56.4 32.1 56.7 46.9 47.6 56.3 32.3 56.6 16.9 56.2 7.6 46.6 7.4 31.7 7.8 16.9 17.8 8.7 32 8.1Z"
            fill="#141414"
            stroke="#e2b441"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <g className="buddy-face">
            <path
              className="buddy-wink"
              d="M20.2 31.6c2.6-3 7.6-3.4 10.6.8"
              stroke="#e2b441"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <ellipse
              className="buddy-open-eye"
              cx="42.4"
              cy="31.2"
              rx="3.7"
              ry="5.3"
              fill="#e2b441"
            />
            <path
              className="buddy-mouth"
              d="M23.4 40.6c3.4 4.8 7.6 6.8 8.6 6.8s5.2-2 8.6-6.8"
              stroke="#e2b441"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
