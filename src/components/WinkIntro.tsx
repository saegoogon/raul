"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Mascot } from "@/components/Mascot";
import { isInAppBrowser } from "@/lib/browser";

export function WinkIntro() {
  const [gone, setGone] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (
      isInAppBrowser(navigator.userAgent) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setGone(true);
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const hide = window.setTimeout(() => setHiding(true), 2400);
    const done = window.setTimeout(() => {
      document.body.style.overflow = previous;
      setGone(true);
    }, 3180);

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
        hiding ? "hiding invisible opacity-0" : "visible opacity-100"
      }`}
      onClick={() => {
        document.body.style.overflow = "";
        setGone(true);
      }}
    >
      <div className="blacksmile-intro-mark flex flex-col items-center">
        <Mascot size="xl" pose="sit" className="buddy-once mx-auto" />
        <p className="mt-4 text-xl">
          <BrandMark />
        </p>
        <p className="mt-2 text-sm text-mute">A small smile can change your world</p>
      </div>
    </div>
  );
}
