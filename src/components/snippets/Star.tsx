"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { starSnippet } from "@/actions/snippets";

export function Star({ snippetId, count, starred }: { snippetId: string; count: number; starred: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [local, setLocal] = useState({ count, starred });
  const [motion, setMotion] = useState<"idle" | "pop" | "drop">("idle");

  const tap = () => {
    const next = !local.starred;
    setLocal({ count: local.count + (next ? 1 : -1), starred: next });
    setMotion(next ? "pop" : "drop");
    window.setTimeout(() => setMotion("idle"), 720);
    start(async () => {
      const result = await starSnippet(snippetId, next);
      if (result && "error" in result && result.error) {
        setLocal({ count, starred });
        setMotion("idle");
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      className={`star-btn${local.starred ? " is-on" : ""}${motion === "pop" ? " is-pop" : ""}${motion === "drop" ? " is-drop" : ""}`}
      disabled={pending}
      onClick={tap}
      aria-pressed={local.starred}
      aria-label="공감"
    >
      <span className="star-burst" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="star-mark" aria-hidden />
      공감
      <em>{local.count}</em>
    </button>
  );
}
