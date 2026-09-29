import { NightBuddy } from "@/components/NightBuddy";

export function WinkLoader() {
  return (
    <div
      className="flex min-h-72 flex-col items-center justify-center py-16"
      aria-busy
      aria-label="Loading"
    >
      <NightBuddy play="loop" className="h-32 w-32" />
      <p className="buddy-caption mt-5 text-sm text-mute">one night only</p>
    </div>
  );
}
