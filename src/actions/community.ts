"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/user";

type ActionState = { error?: string } | null;

function needLogin(): never {
  redirect("/login");
}

async function session() {
  const user = await getCurrentUser();
  if (!user) needLogin();
  return { user, supabase: await createClient() };
}

export async function createPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, supabase } = await session();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const urlRaw = String(formData.get("url") ?? "").trim();
  const roomSlug = String(formData.get("room") ?? "").trim();
  if (title.length < 2) return { error: "Title is required." };
  const { data: room } = await supabase.from("rooms").select("id, slug").eq("slug", roomSlug).maybeSingle();
  if (!room) return { error: "Room not found." };
  let url: string | null = null;
  if (urlRaw) {
    try {
      const parsed = new URL(urlRaw);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return { error: "Use an http(s) link." };
      url = parsed.toString();
    } catch {
      return { error: "Invalid link." };
    }
  }
  const { data, error } = await supabase
    .from("posts")
    .insert({ room_id: room.id, author_id: user.id, title: title.slice(0, 200), body: body.slice(0, 20000), url })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Could not post." };
  revalidatePath("/");
  revalidatePath(`/in/${room.slug}`);
  redirect(`/post/${data.id}`);
}

export async function createComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, supabase } = await session();
  const postId = String(formData.get("postId") ?? "");
  const parentId = String(formData.get("parentId") ?? "") || null;
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1) return { error: "Comment cannot be empty." };
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    parent_id: parentId,
    body: body.slice(0, 8000),
  });
  if (error) return { error: error.message };
  revalidatePath(`/post/${postId}`);
  return null;
}

export async function votePost(postId: string, next: 1 | -1 | 0) {
  const { user, supabase } = await session();
  if (next === 0) {
    await supabase.from("post_votes").delete().eq("user_id", user.id).eq("post_id", postId);
  } else {
    const { error } = await supabase.from("post_votes").upsert({ user_id: user.id, post_id: postId, value: next });
    if (error) return { error: error.message };
  }
  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function voteComment(commentId: string, postId: string, next: 1 | -1 | 0) {
  const { user, supabase } = await session();
  if (next === 0) {
    await supabase.from("comment_votes").delete().eq("user_id", user.id).eq("comment_id", commentId);
  } else {
    await supabase.from("comment_votes").upsert({ user_id: user.id, comment_id: commentId, value: next });
  }
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function createRoom(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, supabase } = await session();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  const description = String(formData.get("description") ?? "").trim().slice(0, 280);
  if (slug.length < 2) return { error: "Slug needs at least 2 characters." };
  if (name.length < 2) return { error: "Name is required." };
  const { error } = await supabase.from("rooms").insert({ slug, name, description, created_by: user.id });
  if (error) return { error: error.message.includes("duplicate") ? "That room already exists." : error.message };
  revalidatePath("/");
  redirect(`/in/${slug}`);
}
