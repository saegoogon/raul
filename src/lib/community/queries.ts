import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/user";
import { isMissingTable } from "@/lib/community/errors";
import type { Comment, FeedSort, Post, Room } from "@/lib/community/types";

export type CommunityStatus = "ok" | "missing" | "offline";

type PostRow = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  score: number;
  comment_count: number;
  created_at: string;
  rooms: { slug: string; name: string } | { slug: string; name: string }[] | null;
  profiles: { username: string } | { username: string }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapPost(row: PostRow, myVote = 0): Post | null {
  const room = one(row.rooms);
  const author = one(row.profiles);
  if (!room || !author) return null;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    url: row.url,
    score: row.score,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    room,
    author,
    myVote,
  };
}

async function db() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function listRooms(): Promise<{ rooms: Room[]; status: CommunityStatus }> {
  const supabase = await db();
  if (!supabase) return { rooms: [], status: "offline" };
  const { data, error } = await supabase.from("rooms").select("id, slug, name, description, created_at").order("name");
  if (error) return { rooms: [], status: isMissingTable(error) ? "missing" : "offline" };
  return {
    status: "ok",
    rooms: (data ?? []).map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
    })),
  };
}

export async function getRoom(slug: string) {
  const { rooms, status } = await listRooms();
  return { status, room: rooms.find((item) => item.slug === slug) ?? null };
}

const POST_SELECT = "id, title, body, url, score, comment_count, created_at, rooms ( slug, name ), profiles ( username )";

export async function listPosts(options: { roomSlug?: string; username?: string; q?: string; sort?: FeedSort; limit?: number }) {
  const supabase = await db();
  if (!supabase) return { posts: [] as Post[], status: "offline" as CommunityStatus };
  const user = await getCurrentUser();
  let query = supabase.from("posts").select(POST_SELECT);
  if (options.roomSlug) {
    const { data: room } = await supabase.from("rooms").select("id").eq("slug", options.roomSlug).maybeSingle();
    if (!room) return { posts: [], status: "ok" };
    query = query.eq("room_id", room.id);
  }
  if (options.username) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("username", options.username).maybeSingle();
    if (!profile) return { posts: [], status: "ok" };
    query = query.eq("author_id", profile.id);
  }
  if (options.q?.trim()) {
    const q = options.q.trim().replace(/[%_,]/g, "");
    query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
  }
  query =
    options.sort === "new"
      ? query.order("created_at", { ascending: false })
      : query.order("score", { ascending: false }).order("created_at", { ascending: false });
  const { data, error } = await query.limit(options.limit ?? 40);
  if (error) return { posts: [], status: isMissingTable(error) ? "missing" : "offline" };

  const rows = (data ?? []) as PostRow[];

  const votes = user ? await myPostVotes(supabase, user.id, rows.map((row) => row.id)) : {};
  return {
    status: "ok" as CommunityStatus,
    posts: rows.map((row) => mapPost(row, votes[row.id] ?? 0)).filter((item): item is Post => Boolean(item)),
  };
}

export async function getPost(id: string) {
  const supabase = await db();
  if (!supabase) return { post: null as Post | null, comments: [] as Comment[], status: "offline" as CommunityStatus };
  const user = await getCurrentUser();
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
  if (error) return { post: null, comments: [], status: isMissingTable(error) ? "missing" : "offline" };
  if (!data) return { post: null, comments: [], status: "ok" };
  const votes = user ? await myPostVotes(supabase, user.id, [id]) : {};
  const post = mapPost(data as PostRow, votes[id] ?? 0);
  const comments = await listComments(supabase, id, user?.id ?? null);
  return { post, comments, status: "ok" as CommunityStatus };
}

async function listComments(supabase: NonNullable<Awaited<ReturnType<typeof db>>>, postId: string, userId: string | null) {
  const { data } = await supabase
    .from("comments")
    .select("id, body, score, created_at, parent_id, profiles ( username )")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  const rows = data ?? [];
  const mine = userId
    ? await supabase.from("comment_votes").select("comment_id, value").eq("user_id", userId).in(
        "comment_id",
        rows.map((row) => row.id),
      )
    : { data: [] };
  const voteMap = Object.fromEntries((mine.data ?? []).map((row) => [row.comment_id, row.value]));
  return rows
    .map((row) => {
      const author = one(row.profiles as { username: string } | { username: string }[] | null);
      if (!author) return null;
      return {
        id: row.id,
        body: row.body,
        score: row.score,
        createdAt: row.created_at,
        parentId: row.parent_id,
        author,
        myVote: voteMap[row.id] ?? 0,
      } satisfies Comment;
    })
    .filter((item): item is Comment => Boolean(item));
}

async function myPostVotes(supabase: NonNullable<Awaited<ReturnType<typeof db>>>, userId: string, ids: string[]) {
  if (!ids.length) return {} as Record<string, number>;
  const { data } = await supabase.from("post_votes").select("post_id, value").eq("user_id", userId).in("post_id", ids);
  return Object.fromEntries((data ?? []).map((row) => [row.post_id, row.value])) as Record<string, number>;
}

export async function getProfileByUsername(username: string) {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("id, username, created_at").eq("username", username).maybeSingle();
  return data;
}

export async function getProfileById(id: string) {
  const supabase = await db();
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("id, username, created_at").eq("id", id).maybeSingle();
  return data;
}
