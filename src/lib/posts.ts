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

  return posts.map((post) => {
    const postVotes = votes?.filter((v) => v.post_id === post.id) ?? [];
    const voteCount = postVotes.reduce((sum, v) => sum + v.value, 0);
    const userVote = userId
      ? (postVotes.find((v) => v.user_id === userId)?.value ?? null)
      : null;

    return { ...post, vote_count: voteCount, user_vote: userVote };
  });
}

export async function getPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return attachVoteData(data as Post[], user?.id);
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
