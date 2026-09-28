export function SmileMark({
  className = "h-6 w-6",
  wink,
}: {
  className?: string;
  wink?: "hover" | "once" | "loop";
}) {
  const eyeClass =
    wink === "hover"
      ? "blacksmile-wink-hover"
      : wink === "once"
        ? "blacksmile-wink"
        : wink === "loop"
          ? "blacksmile-wink-loop"
          : undefined;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        className={eyeClass}
        cx="11.5"
        cy="13"
        r="1.7"
        fill="currentColor"
      />
      <circle cx="20.5" cy="13" r="1.7" fill="currentColor" />
      <path
        d="M10 19.5c1.6 2.2 4 3.3 6 3.3s4.4-1.1 6-3.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
