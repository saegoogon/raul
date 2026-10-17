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

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hide]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal aria-label="검색" onClick={hide}>
      <div className="search-sheet" onClick={(event) => event.stopPropagation()}>
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
            placeholder="글과 코드 검색"
            className="search-input"
            aria-label="BlackSmile 검색"
          />
          <button type="button" className="btn-ghost" onClick={hide}>
            닫기
          </button>
        </form>
        <p className="mute">Enter로 찾습니다.</p>
      </div>
    </div>
  );
}
