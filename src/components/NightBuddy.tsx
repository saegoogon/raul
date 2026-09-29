export function NightBuddy({
  play = "loop",
  className = "h-28 w-28",
}: {
  play?: "loop" | "once";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 148"
      className={`buddy buddy-${play} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g className="buddy-float">
        <g className="buddy-squash">
          <path
            d="M60 10c22.5 0 41 16.8 41 41.5 0 14.2-6.4 26.2-16.2 34.2 2.4 8.6 4.6 20.8-1.2 28.6-5.4 7.2-15.8 11.7-23.6 11.7s-18.2-4.5-23.6-11.7c-5.8-7.8-3.6-20-1.2-28.6C25.4 77.7 19 65.7 19 51.5 19 26.8 37.5 10 60 10z"
            fill="#111111"
            stroke="#ece8dc"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          <g className="buddy-face">
            <ellipse
              className="buddy-eye-left"
              cx="44.5"
              cy="56"
              rx="6.2"
              ry="7.6"
              fill="#e2b441"
            />
            <ellipse
              className="buddy-eye-right"
              cx="75.5"
              cy="56"
              rx="6.2"
              ry="7.6"
              fill="#e2b441"
            />
            <ellipse
              className="buddy-shine"
              cx="77.4"
              cy="53.2"
              rx="2"
              ry="2.6"
              fill="#fff6d6"
            />
            <path
              className="buddy-mouth"
              d="M46 78c3.6 8.4 9.6 12.4 14 12.4s10.4-4 14-12.4"
              stroke="#e2b441"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
