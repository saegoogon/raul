"use client";

import { useClock } from "@/components/Providers";
import { timeAgo, timeLeft } from "@/lib/timeAgo";

export function TimeAgo({
  date,
  mode = "left",
}: {
  date: string;
  mode?: "left" | "ago";
}) {
  const now = useClock();
  const label = now
    ? mode === "left"
      ? timeLeft(date, now)
      : timeAgo(date, now)
    : "";

  return <p className="text-xs text-mute">{label || "\u00a0"}</p>;
}
