"use client";

import { useEffect, useRef, useState } from "react";

export function ShortsPlayer({ src }: { src: string; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { threshold: 0.35 },
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mounted) return;
    if (inView) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, mounted]);

  return (
    <div
      ref={boxRef}
      className="relative aspect-square w-full overflow-hidden bg-black"
    >
      {mounted ? (
        <video
          ref={videoRef}
          src={src}
          className="absolute inset-0 h-full w-full object-contain"
          muted
          loop
          playsInline
          controls
          preload="metadata"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
          ▶
        </div>
      )}
    </div>
  );
}
