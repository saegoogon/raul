export function WinkLoader() {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center py-16"
      aria-busy
      aria-label="Loading"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-16 w-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="blacksmile-wink-loop"
          cx="11.5"
          cy="13"
          r="1.7"
          fill="#fcd34d"
        />
        <circle cx="20.5" cy="13" r="1.7" fill="#fcd34d" />
        <path
          d="M10 19.5c1.6 2.2 4 3.3 6 3.3s4.4-1.1 6-3.3"
          stroke="#fcd34d"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
