import { cache } from "react";
import { livingSince } from "@/lib/life";
import { getCurrentUser, getPosts } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";
import type { RankEntry } from "@/lib/types";

const SMILE_POINTS = 3;
const POST_POINTS = 1;
const WINK_POINTS = 1;

type Row = {
  userId: string;
  username: string;
  smiles: number;
  posts: number;
  winks: number;
};

function toBoard(rows: Row[]): RankEntry[] {
  return [...rows]
    .map((row) => ({
      ...row,
      score:
        row.smiles * SMILE_POINTS +
        row.posts * POST_POINTS +
        row.winks * WINK_POINTS,
      rank: 0,
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export const getTonightRank = cache(async () => {
  const [user, posts] = await Promise.all([
    getCurrentUser(),
    getPosts("new"),
  ]);

  const byUser = new Map<string, Row>();

  for (const post of posts) {
    const username = post.profiles?.username;
    if (!username) continue;
    const current = byUser.get(post.user_id) ?? {
      userId: post.user_id,
      username,
      smiles: 0,
      posts: 0,
      winks: 0,
    };
    current.posts += 1;
    current.smiles += Math.max(post.vote_count ?? 0, 0);
    byUser.set(post.user_id, current);
  }

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

      const missing = [...counts.keys()].filter((id) => !byUser.has(id));
      if (missing.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", missing);
        for (const profile of profiles ?? []) {
          byUser.set(profile.id, {
            userId: profile.id,
            username: profile.username,
            smiles: 0,
            posts: 0,
            winks: 0,
          });
        }
      }

      for (const [userId, winks] of counts) {
        const current = byUser.get(userId);
        if (current) current.winks = winks;
      }
    }
  } catch {
    // Ranking still works from tonight's smiles and posts.
  }

  const board = toBoard([...byUser.values()]);
  const mine = user ? (board.find((row) => row.userId === user.id) ?? null) : null;

  return { board, mine, userId: user?.id ?? null };
});
