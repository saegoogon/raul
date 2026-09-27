"use client";

import { useEffect, useState } from "react";

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 transition-opacity duration-300 ${
        hiding ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-24 w-24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="blacksmile-wink"
          cx="11.5"
          cy="13"
          r="1.7"
          fill="#fcd34d"
        />
        <circle cx="20.5" cy="13" r="1.7" fill="#fcd34d" />
        <path
          d="M10 19.5c1.6 2.2 4 3.3 6 3.3s4.4-1.1 6-3.3"
          stroke="#fcd34d"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-4 text-lg font-bold tracking-tight text-white">
        blacksmile
        <sup className="ml-0.5 text-[0.55em] font-semibold opacity-70">TM</sup>
      </p>
    </div>
  );
}
