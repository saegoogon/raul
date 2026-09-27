"use client";

import { useEffect, useRef, useState } from "react";

export function ShortsPlayer({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="bg-black">
      {active ? (
        <video
          src={src}
          className={className}
          muted
          loop
          playsInline
          controls
          autoPlay
          preload="metadata"
        />
      ) : (
        <div className={`flex items-center justify-center bg-zinc-950 text-zinc-500 ${className}`}>
          ▶
        </div>
      )}
    </div>
  );
}
