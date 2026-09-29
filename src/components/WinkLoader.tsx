import { NightBuddy } from "@/components/NightBuddy";

export function WinkLoader() {
  return (
    <div
      className="flex min-h-80 flex-col items-center justify-center py-16"
      aria-busy
      aria-label="Loading"
    >
      <NightBuddy play="loop" className="h-36 w-36" />
      <p className="buddy-caption mt-4 text-sm text-mute">one night only</p>
    </div>
  );
}
