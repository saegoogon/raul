export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={className}>
      blacksmile
      <sup className="ml-0.5 text-[0.55em] font-semibold tracking-tight opacity-70">
        TM
      </sup>
    </span>
  );
}
