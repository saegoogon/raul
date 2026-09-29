import { Mascot } from "@/components/Mascot";

export function WinkLoader() {
  return (
    <div
      className="buddy-scene flex min-h-80 flex-col items-center justify-center py-16"
      aria-busy
      aria-label="Loading"
    >
      <div className="buddy-stage">
        <span className="buddy-ring" aria-hidden />
        <Mascot size="xl" pose="wait" priority className="buddy-hop" />
        <span className="buddy-shadow" aria-hidden />
      </div>
      <p className="buddy-caption mt-5 text-sm text-mute">More fun together</p>
      <span className="buddy-dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
