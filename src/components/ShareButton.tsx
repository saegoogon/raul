"use client";

import { useState } from "react";

export function ShareButton({
  path,
  title,
  text,
  dark,
  label = "Pass",
}: {
  path: string;
  title: string;
  text?: string;
  dark?: boolean;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const url = new URL(path, window.location.origin).toString();
        const payload = { title, text: text ?? title, url };
        if (navigator.share) {
          try {
            await navigator.share(payload);
            return;
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
              return;
            }
          }
        }
        await navigator.clipboard.writeText(`${payload.text}\n${url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
      className={
        dark
          ? "rounded-full border border-zinc-600 px-4 py-1.5 text-sm text-white hover:border-zinc-400"
          : "rounded-full px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-950 hover:text-amber-200"
      }
    >
      {copied ? "Copied" : label}
    </button>
  );
}
