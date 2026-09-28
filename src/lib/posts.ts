import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isAlive, livingSince } from "@/lib/life";
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

export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});

export const getPosts = cache(async (
  sort: "hot" | "new" = "hot",
  query?: string,
): Promise<Post[]> => {
  try {
    const supabase = await createClient();
    let request = supabase
      .from("posts")
      .select(postSelect)
      .gte("created_at", livingSince().toISOString())
      .order("created_at", { ascending: false })
      .limit(40);

    const q = query?.trim().replace(/[%(),]/g, "").slice(0, 40);
    if (q) {
      request = request.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    const [user, { data, error }] = await Promise.all([
      getCurrentUser(),
      request,
    ]);

    if (error || !data) return [];

    const posts = (data as RawPost[]).map((row) => toPost(row, user?.id));
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
});

export const getPost = cache(async (id: string): Promise<Post | null> => {
  try {
    const supabase = await createClient();
    const [user, { data, error }] = await Promise.all([
      getCurrentUser(),
      supabase
        .from("posts")
        .select(postSelect)
        .eq("id", id)
        .gte("created_at", livingSince().toISOString())
        .single(),
    ]);

    if (error || !data) return null;
    const post = toPost(data as RawPost, user?.id);
    if (!isAlive(post.created_at)) return null;
    return post;
  } catch {
    return null;
  }
});

export const getComments = cache(async (postId: string): Promise<Comment[]> => {
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
});

export const getProfile = cache(async (username: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, created_at")
      .eq("username", username)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
});

export const getPostsByUser = cache(async (userId: string): Promise<Post[]> => {
  try {
    const supabase = await createClient();
    const [user, { data, error }] = await Promise.all([
      getCurrentUser(),
      supabase
        .from("posts")
        .select(postSelect)
        .eq("user_id", userId)
        .gte("created_at", livingSince().toISOString())
        .order("created_at", { ascending: false }),
    ]);

    if (error || !data) return [];
    return (data as RawPost[]).map((row) => toPost(row, user?.id));
  } catch {
    return [];
  }
});
