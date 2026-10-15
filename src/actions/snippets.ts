"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLanguage } from "@/lib/snippets/languages";
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

export async function createSnippet(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, supabase } = await session();
  const title = String(formData.get("title") ?? "").trim();
  const languageRaw = String(formData.get("language") ?? "").trim();
  const code = String(formData.get("code") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 8000);
  const language = isLanguage(languageRaw) ? languageRaw : "text";
  if (title.length < 1) return { error: "Title is required." };
  if (!note && !code.trim()) return { error: "Write something, or paste code." };
  const { data, error } = await supabase
    .from("snippets")
    .insert({
      author_id: user.id,
      title: title.slice(0, 200),
      language,
      code: code.slice(0, 40000),
      note,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Could not save." };
  revalidatePath("/");
  redirect(`/s/${data.id}`);
}

export async function createComment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, supabase } = await session();
  const snippetId = String(formData.get("snippetId") ?? "");
  const parentId = String(formData.get("parentId") ?? "") || null;
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1) return { error: "Comment cannot be empty." };
  const { error } = await supabase.from("snippet_comments").insert({
    snippet_id: snippetId,
    author_id: user.id,
    parent_id: parentId,
    body: body.slice(0, 8000),
  });
  if (error) return { error: error.message };
  revalidatePath(`/s/${snippetId}`);
  return null;
}

export async function starSnippet(snippetId: string, next: boolean) {
  const { user, supabase } = await session();
  if (next) {
    const { error } = await supabase.from("snippet_stars").upsert({ user_id: user.id, snippet_id: snippetId });
    if (error) return { error: error.message };
  } else {
    await supabase.from("snippet_stars").delete().eq("user_id", user.id).eq("snippet_id", snippetId);
  }
  revalidatePath("/");
  revalidatePath(`/s/${snippetId}`);
  return { ok: true };
}
