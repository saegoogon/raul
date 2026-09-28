import { SmileMark } from "@/components/SmileMark";

export function WinkLoader() {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center py-16"
      aria-busy
      aria-label="Loading"
    >
      <SmileMark className="h-16 w-16 text-smile" wink="loop" />
    </div>
  );
}
