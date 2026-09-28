"use client";

import { useState } from "react";

const SHARE_URL = "https://www.blacksmile.co.kr";
const SHARE_TEXT = "blacksmile — 어둠 속의 미소. 팔로우 없이, 오늘 밤만.";

export function InviteNight({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          if (navigator.share) {
            await navigator.share({
              title: "blacksmile",
              text: SHARE_TEXT,
              url: SHARE_URL,
            });
            return;
          }
          await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          try {
            await navigator.clipboard.writeText(SHARE_URL);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            window.location.href = SHARE_URL;
          }
        }
      }}
    >
      {copied ? "링크 복사됨" : "친구에게 오늘 밤 보내기"}
    </button>
  );
}
