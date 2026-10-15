"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "@/components/search/SearchProvider";

export function SearchOverlay() {
  const { open, hide } = useSearch();
  const router = useRouter();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      window.setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal aria-label="Search">
      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          hide();
          router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
        }}
      >
        <input
          ref={input}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search"
          className="search-input"
          aria-label="Search BlackSmile"
        />
        <button type="button" className="btn-ghost" onClick={hide}>
          Close
        </button>
      </form>
      <p className="mute" style={{ marginTop: 24 }}>
        Search posts and code.
      </p>
    </div>
  );
}
