export function Grin({ size = 48, caption }: { size?: number; caption?: string }) {
  return (
    <figure className="grin-mascot">
      <svg width={size} height={size * 0.7} viewBox="0 0 48 34" aria-hidden>
        <circle cx="12" cy="10" r="3.2" fill="currentColor" />
        <circle cx="36" cy="10" r="3.2" fill="currentColor" />
        <path d="M10 22c6 8 22 8 28 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
