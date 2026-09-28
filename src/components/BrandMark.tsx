export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={`tracking-tight ${className ?? ""}`}>
      <span className="text-paper">black</span>
      <span className="text-smile">smile</span>
      <sup className="ml-0.5 text-[0.55em] font-semibold tracking-tight text-mute">
        TM
      </sup>
    </span>
  );
}
