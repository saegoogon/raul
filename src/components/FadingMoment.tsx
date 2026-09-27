"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fadeForAge } from "@/lib/fade";

export function FadingMoment({
  createdAt,
  children,
}: {
  createdAt: string;
  children: ReactNode;
}) {
  const [opacity, setOpacity] = useState(() => fadeForAge(createdAt));

  useEffect(() => {
    const tick = () => setOpacity(fadeForAge(createdAt));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [createdAt]);

  return (
    <div
      style={{ opacity }}
      className="transition-opacity duration-1000"
    >
      {children}
    </div>
  );
}
