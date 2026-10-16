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
    <div className="search-overlay" role="dialog" aria-modal aria-label="검색">
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
          placeholder="검색"
          className="search-input"
          aria-label="BlackSmile 검색"
        />
        <button type="button" className="btn-ghost" onClick={hide}>
          닫기
        </button>
      </form>
      <p className="mute" style={{ marginTop: 24 }}>
        글과 코드를 찾습니다.
      </p>
    </div>
  );
}
