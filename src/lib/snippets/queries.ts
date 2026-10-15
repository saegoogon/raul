import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/user";
import { isMissingTable } from "@/lib/snippets/errors";
import { isLanguage } from "@/lib/snippets/languages";
import type { Comment, FeedSort, Snippet } from "@/lib/snippets/types";

export type SnippetStatus = "ok" | "missing" | "offline";

type SnippetRow = {
  id: string;
  title: string;
  language: string;
  code: string;
  note: string;
  star_count: number;
  comment_count: number;
  created_at: string;
  profiles: { username: string } | { username: string }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapSnippet(row: SnippetRow, starred = false): Snippet | null {
  const author = one(row.profiles);
  if (!author || !isLanguage(row.language)) return null;
  return {
    id: row.id,
    title: row.title,
    language: row.language,
    code: row.code,
    note: row.note,
    starCount: row.star_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    author,
    starred,
  };
}

async function db() {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

const SNIPPET_SELECT = "id, title, language, code, note, star_count, comment_count, created_at, profiles ( username )";

export async function listSnippets(options: {
  username?: string;
  q?: string;
  language?: string;
  sort?: FeedSort;
  since?: string;
  limit?: number;
}) {
  const supabase = await db();
  if (!supabase) return { snippets: [] as Snippet[], status: "offline" as SnippetStatus };
  const user = await getCurrentUser();
  let query = supabase.from("snippets").select(SNIPPET_SELECT);
  if (options.since) query = query.gte("created_at", options.since);
  if (options.username) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("username", options.username).maybeSingle();
    if (!profile) return { snippets: [], status: "ok" as SnippetStatus };
    query = query.eq("author_id", profile.id);
  }
  if (options.language && isLanguage(options.language)) {
    query = query.eq("language", options.language);
  }
  if (options.q?.trim()) {
    const q = options.q.trim().replace(/[%_,]/g, "");
    query = query.or(`title.ilike.%${q}%,note.ilike.%${q}%,code.ilike.%${q}%`);
  }
  query =
    options.sort === "new"
      ? query.order("created_at", { ascending: false })
      : query.order("star_count", { ascending: false }).order("created_at", { ascending: false });
  const { data, error } = await query.limit(options.limit ?? 40);
  if (error) return { snippets: [], status: isMissingTable(error) ? "missing" : "offline" };

  const rows = (data ?? []) as SnippetRow[];
  const stars = user ? await myStars(supabase, user.id, rows.map((row) => row.id)) : {};
  return {
    status: "ok" as SnippetStatus,
    snippets: rows.map((row) => mapSnippet(row, Boolean(stars[row.id]))).filter((item): item is Snippet => Boolean(item)),
  };
}

export async function getSnippet(id: string) {
  const supabase = await db();
  if (!supabase) return { snippet: null as Snippet | null, comments: [] as Comment[], status: "offline" as SnippetStatus };
  const user = await getCurrentUser();
  const { data, error } = await supabase.from("snippets").select(SNIPPET_SELECT).eq("id", id).maybeSingle();
  if (error) return { snippet: null, comments: [], status: isMissingTable(error) ? "missing" : "offline" };
  if (!data) return { snippet: null, comments: [], status: "ok" as SnippetStatus };
  const stars = user ? await myStars(supabase, user.id, [id]) : {};
  const snippet = mapSnippet(data as SnippetRow, Boolean(stars[id]));
  const comments = await listComments(supabase, id);
  return { snippet, comments, status: "ok" as SnippetStatus };
}

async function listComments(supabase: NonNullable<Awaited<ReturnType<typeof db>>>, snippetId: string) {
  const { data } = await supabase
    .from("snippet_comments")
    .select("id, body, created_at, parent_id, profiles ( username )")
    .eq("snippet_id", snippetId)
    .order("created_at", { ascending: true });
  return (data ?? [])
    .map((row) => {
      const author = one(row.profiles as { username: string } | { username: string }[] | null);
      if (!author) return null;
      return {
        id: row.id,
        body: row.body,
        createdAt: row.created_at,
        parentId: row.parent_id,
        author,
      } satisfies Comment;
    })
    .filter((item): item is Comment => Boolean(item));
}

async function myStars(supabase: NonNullable<Awaited<ReturnType<typeof db>>>, userId: string, ids: string[]) {
  if (!ids.length) return {} as Record<string, true>;
  const { data } = await supabase.from("snippet_stars").select("snippet_id").eq("user_id", userId).in("snippet_id", ids);
  return Object.fromEntries((data ?? []).map((row) => [row.snippet_id, true])) as Record<string, true>;
}

export function weekAgoIso() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export async function weekBoard() {
  const { snippets, status } = await listSnippets({ sort: "hot", since: weekAgoIso(), limit: 50 });
  const counts = new Map<string, number>();
  for (const item of snippets) {
    if (!item.code.trim()) continue;
    counts.set(item.language, (counts.get(item.language) ?? 0) + 1);
  }
  const trends = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([language, count]) => ({ language, count }));
  return { status, top: snippets.slice(0, 3), trends };
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
