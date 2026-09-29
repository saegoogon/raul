const stroke = {
  stroke: "#e2b441",
  strokeWidth: 3.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function NightBuddy({
  play = "loop",
  className = "h-28 w-28",
}: {
  play?: "loop" | "once";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 280 200"
      className={`buddy buddy-${play} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g className="buddy-float">
        <g className="buddy-squash">
          <g className="buddy-arm-left">
            <path d="M86 108 C58 106 34 102 22 108" {...stroke} />
            <path d="M22 108 C14 98 24 92 36 100 C28 108 18 112 22 108" {...stroke} />
          </g>
          <g className="buddy-arm-right">
            <path d="M196 106 C224 102 248 96 260 102" {...stroke} />
            <path d="M260 102 C270 94 264 112 250 108 C256 102 264 98 260 102" {...stroke} />
          </g>

          <path
            d="M92 46 C108 28 176 26 200 54 C218 78 216 128 192 148 C172 164 110 166 90 148 C68 128 70 70 92 46 Z"
            {...stroke}
          />

          <g className="buddy-face">
            <g className="buddy-wink">
              <path d="M102 72 L126 98" {...stroke} />
              <path d="M126 70 L100 100" {...stroke} />
            </g>
            <ellipse
              className="buddy-open-eye"
              cx="164"
              cy="84"
              rx="13"
              ry="16"
              {...stroke}
            />
            <path
              className="buddy-mouth"
              d="M118 118 C132 130 146 122 152 116 C158 128 170 122 176 114"
              {...stroke}
            />
          </g>

          <g className="buddy-leg-left">
            <path d="M118 150 L118 170" {...stroke} />
            <path d="M118 170 L98 174" {...stroke} />
            <path d="M118 170 L132 176" {...stroke} />
          </g>
          <g className="buddy-leg-right">
            <path d="M164 150 L164 170" {...stroke} />
            <path d="M164 170 L184 176" {...stroke} />
            <path d="M164 170 L150 174" {...stroke} />
          </g>
        </g>
      </g>
    </svg>
  );
}
