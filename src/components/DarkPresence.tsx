"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const WINDOW_MS = 75_000;

function visitorId() {
  try {
    const key = "blacksmile-visitor";
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const next =
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return `tmp-${Date.now()}`;
  }
}

export function DarkPresence() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const beat = async () => {
      if (document.hidden) return;
      const since = new Date(Date.now() - WINDOW_MS).toISOString();
      try {
        await supabase.from("presence").upsert({
          visitor_id: visitorId(),
          last_seen: new Date().toISOString(),
        });
        const { count: awake } = await supabase
          .from("presence")
          .select("*", { count: "exact", head: true })
          .gte("last_seen", since);
        if (!cancelled) setCount(Math.max(awake ?? 1, 1));
      } catch {
        if (!cancelled) setCount(1);
      }
    };

    void beat();
    const id = window.setInterval(beat, 45_000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);

  const n = count ?? 1;
  const alone = n <= 1;

  return (
    <p className="text-sm text-smile">
      {alone
        ? "You are alone in the dark."
        : `${n} people are awake in the dark.`}
    </p>
  );
}
