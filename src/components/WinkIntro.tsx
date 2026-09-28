"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SmileMark } from "@/components/SmileMark";

export function WinkIntro() {
  const [gone, setGone] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const hide = window.setTimeout(() => setHiding(true), 1150);
    const done = window.setTimeout(() => {
      document.body.style.overflow = previous;
      setGone(true);
    }, 1550);

    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(done);
      document.body.style.overflow = previous;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-night transition-opacity duration-300 ${
        hiding ? "opacity-0" : "opacity-100"
      }`}
    >
      <SmileMark className="h-24 w-24 text-smile" wink="once" />
      <p className="mt-5 text-2xl font-bold tracking-tight">
        <BrandMark />
      </p>
      <p className="font-display mt-2 text-sm italic text-mute">
        a smile in the dark
      </p>
    </div>
  );
}
