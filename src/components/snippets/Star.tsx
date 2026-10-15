"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { starSnippet } from "@/actions/snippets";

export function Star({ snippetId, count, starred }: { snippetId: string; count: number; starred: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [local, setLocal] = useState({ count, starred });

  const tap = () => {
    const next = !local.starred;
    setLocal({ count: local.count + (next ? 1 : -1), starred: next });
    start(async () => {
      const result = await starSnippet(snippetId, next);
      if (result && "error" in result && result.error) {
        setLocal({ count, starred });
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      className={`star-btn${local.starred ? " is-on" : ""}`}
      disabled={pending}
      onClick={tap}
      aria-pressed={local.starred}
      aria-label="Feel"
    >
      Feel {local.count}
    </button>
  );
}
