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

    const hide = window.setTimeout(() => setHiding(true), 2100);
    const done = window.setTimeout(() => {
      document.body.style.overflow = previous;
      setGone(true);
    }, 2850);

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
      className={`blacksmile-intro fixed inset-0 z-50 flex flex-col items-center justify-center bg-night ${
        hiding ? "invisible opacity-0" : "visible opacity-100"
      }`}
    >
      <div className="blacksmile-intro-mark flex flex-col items-center">
        <SmileMark className="h-24 w-24 text-smile" wink="once" />
        <p className="mt-5 text-2xl font-bold tracking-tight">
          <BrandMark />
        </p>
        <p className="mt-2 text-sm tracking-tight text-mute">어둠 속의 미소</p>
      </div>
    </div>
  );
}
