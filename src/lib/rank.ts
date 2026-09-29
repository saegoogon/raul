import { cache } from "react";
import { livingSince } from "@/lib/life";
import { getCurrentUser } from "@/lib/user";
import { createClient } from "@/lib/supabase/server";
import type { RankEntry } from "@/lib/types";

export const getTonightRank = cache(async () => {
  const user = await getCurrentUser();
  const byUser = new Map<string, RankEntry>();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("winks")
      .select("user_id")
      .gte("created_at", livingSince().toISOString());

    if (!error && data && data.length > 0) {
      const counts = new Map<string, number>();
      for (const wink of data as { user_id: string }[]) {
        counts.set(wink.user_id, (counts.get(wink.user_id) ?? 0) + 1);
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", [...counts.keys()]);

      for (const profile of profiles ?? []) {
        const winks = counts.get(profile.id) ?? 0;
        byUser.set(profile.id, {
          userId: profile.id,
          username: profile.username,
          rank: 0,
          score: winks,
          winks,
        });
      }
    }
  } catch {
    // Ranking stays empty until winks exist.
  }

  const board = [...byUser.values()]
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username))
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const mine = user ? (board.find((row) => row.userId === user.id) ?? null) : null;
  return { board, mine, userId: user?.id ?? null };
});
