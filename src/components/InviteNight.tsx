"use client";

import { useState } from "react";

const SHARE_URL = "https://www.blacksmile.co.kr";
const SHARE_TEXT = `BlackSmile — more fun together.\n${SHARE_URL}`;

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
              title: "BlackSmile",
              text: SHARE_TEXT,
              url: SHARE_URL,
            });
            return;
          }
          await navigator.clipboard.writeText(SHARE_TEXT);
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
            window.prompt("Copy this link", SHARE_URL);
          }
        }
      }}
    >
      {copied ? "Copied" : "Send tonight to a friend"}
    </button>
  );
}
