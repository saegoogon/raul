import { Mascot } from "@/components/Mascot";

export function WinkLoader() {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center py-16"
      aria-busy
      aria-label="Loading"
    >
      <Mascot size="md" bob />
    </div>
  );
}
