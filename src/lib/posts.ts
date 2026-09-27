import { createClient } from "@/lib/supabase/server";
import type { Comment, Post } from "@/lib/types";

type RawPost = Post & {
  votes?: { value: number; user_id: string }[] | null;
  comments?: { count: number }[] | null;
};

function toPost(raw: RawPost, userId?: string): Post {
  const votes = raw.votes ?? [];
  const { votes: _votes, comments, ...post } = raw;
  return {
    ...post,
    vote_count: votes.reduce((sum, vote) => sum + vote.value, 0),
    user_vote: userId
      ? (votes.find((vote) => vote.user_id === userId)?.value ?? null)
      : null,
    comment_count: comments?.[0]?.count ?? 0,
  };
}

const postSelect =
  "*, profiles(username), votes(value, user_id), comments(count)";

export async function getPosts(sort: "hot" | "new" = "hot"): Promise<Post[]> {
  try {
    const supabase = await createClient();
    const [{ data: auth }, { data, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("posts")
        .select(postSelect)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    if (error || !data) return [];

    const posts = (data as RawPost[]).map((row) =>
      toPost(row, auth.user?.id),
    );
    if (sort === "new") return posts;

    return [...posts].sort((a, b) => {
      const scoreA = (a.vote_count ?? 0) + (a.comment_count ?? 0);
      const scoreB = (b.vote_count ?? 0) + (b.comment_count ?? 0);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } catch {
    return [];
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const supabase = await createClient();
    const [{ data: auth }, { data, error }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("posts").select(postSelect).eq("id", id).single(),
    ]);

    if (error || !data) return null;
    return toPost(data as RawPost, auth.user?.id);
  } catch {
    return null;
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as Comment[];
  } catch {
    return [];
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
