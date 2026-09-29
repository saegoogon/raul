export function Crown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M5 18h14v2H5v-2zm.8-3 2.7-7.2 3.5 4.4L14.5 6l4.7 9H5.8z" />
    </svg>
  );
}
