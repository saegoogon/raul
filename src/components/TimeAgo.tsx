"use client";

import { useEffect, useState } from "react";
import { timeAgo, timeLeft } from "@/lib/timeAgo";

export function TimeAgo({
  date,
  mode = "left",
}: {
  date: string;
  mode?: "left" | "ago";
}) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => setLabel(mode === "left" ? timeLeft(date) : timeAgo(date));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [date, mode]);

  return <p className="text-xs text-mute">{label || "\u00a0"}</p>;
}
