"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/timeAgo";

export function TimeAgo({ date }: { date: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(timeAgo(date));
  }, [date]);

  return <p className="text-xs text-zinc-500">{label || "\u00a0"}</p>;
}
