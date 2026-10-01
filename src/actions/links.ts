"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SLUG_PATTERN, USERNAME_PATTERN, normalizeUrl, randomSlug, hostOf } from "@/lib/links";

export type Result = { ok: true } | { ok: false; error: string };

async function session() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

function done(): Result {
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

const DUPLICATE = "23505";

export async function createLink(input: { url: string; title: string; slug: string; onPage: boolean }): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };

  const url = normalizeUrl(input.url);
  if (!url) return { ok: false, error: "Enter a valid web address." };
  const custom = input.slug.trim();
  if (custom && !SLUG_PATTERN.test(custom)) {
    return { ok: false, error: "Short code: 3–32 letters, numbers, - or _." };
  }

  const { data: top } = await ctx.supabase
    .from("links")
    .select("position")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  const title = input.title.trim().slice(0, 100) || hostOf(url);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { error } = await ctx.supabase.from("links").insert({
      owner_id: ctx.user.id,
      slug: custom || randomSlug(attempt < 3 ? 6 : 8),
      url,
      title,
      on_page: input.onPage,
      position: (top?.position ?? 1) - 1,
    });
    if (!error) return done();
    if (error.code !== DUPLICATE) return { ok: false, error: "Could not create the link." };
    if (custom) return { ok: false, error: "That short code is taken." };
  }
  return { ok: false, error: "Could not create the link. Try again." };
}

export async function updateLink(id: string, input: { url: string; title: string; slug: string }): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const url = normalizeUrl(input.url);
  if (!url) return { ok: false, error: "Enter a valid web address." };
  const slug = input.slug.trim();
  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: "Short code: 3–32 letters, numbers, - or _." };

  const { error } = await ctx.supabase
    .from("links")
    .update({ url, slug, title: input.title.trim().slice(0, 100) || hostOf(url) })
    .eq("id", id);
  if (error?.code === DUPLICATE) return { ok: false, error: "That short code is taken." };
  if (error) return { ok: false, error: "Could not save the link." };
  return done();
}

export async function setLinkFlag(id: string, flag: "active" | "on_page", value: boolean): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const { error } = await ctx.supabase.from("links").update({ [flag]: value }).eq("id", id);
  if (error) return { ok: false, error: "Could not update the link." };
  return done();
}

export async function deleteLink(id: string): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const { error } = await ctx.supabase.from("links").delete().eq("id", id);
  if (error) return { ok: false, error: "Could not delete the link." };
  return done();
}

export async function reorderLinks(ids: string[]): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const results = await Promise.all(
    ids.slice(0, 500).map((id, position) => ctx.supabase.from("links").update({ position }).eq("id", id)),
  );
  if (results.some((result) => result.error)) return { ok: false, error: "Could not save the order." };
  return done();
}

export async function updateProfile(input: { username: string; displayName: string; bio: string }): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const username = input.username.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) {
    return { ok: false, error: "Username: 3–20 lowercase letters, numbers, or _." };
  }
  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      username,
      display_name: input.displayName.trim().slice(0, 60),
      bio: input.bio.trim().slice(0, 280),
    })
    .eq("id", ctx.user.id);
  if (error?.code === DUPLICATE) return { ok: false, error: "That username is taken." };
  if (error) return { ok: false, error: "Could not save your page." };
  return done();
}
