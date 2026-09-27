import { createClient } from "@/lib/supabase/server";
import type { Comment, Post } from "@/lib/types";

async function attachVoteData(posts: Post[], userId?: string) {
  if (posts.length === 0) return posts;

  const supabase = await createClient();
  const postIds = posts.map((p) => p.id);

  const { data: votes } = await supabase
    .from("votes")
    .select("post_id, value, user_id")
    .in("post_id", postIds);

  const { data: comments } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds);

  return posts.map((post) => {
    const postVotes = votes?.filter((v) => v.post_id === post.id) ?? [];
    const voteCount = postVotes.reduce((sum, v) => sum + v.value, 0);
    const userVote = userId
      ? (postVotes.find((v) => v.user_id === userId)?.value ?? null)
      : null;
    const commentCount =
      comments?.filter((c) => c.post_id === post.id).length ?? 0;

    return {
      ...post,
      vote_count: voteCount,
      user_vote: userVote,
      comment_count: commentCount,
    };
  });
}

export async function getPosts(sort: "hot" | "new" = "hot"): Promise<Post[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    const posts = await attachVoteData(data as Post[], user?.id);
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(username)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const [post] = await attachVoteData([data as Post], user?.id);
  return post;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Comment[];
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
