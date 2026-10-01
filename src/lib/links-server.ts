import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LINK_COLUMNS, type LinkRow, type Profile } from "@/lib/links";

export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
});

export const getProfile = cache(async (): Promise<Profile> => {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, bio")
    .eq("id", user.id)
    .maybeSingle();
  return {
    username: data?.username ?? "",
    display_name: data?.display_name ?? "",
    bio: data?.bio ?? "",
  };
});

export async function listLinks() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("links")
    .select(LINK_COLUMNS)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as LinkRow[];
}

export function since(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export async function clicksByLink(days: number) {
  const { supabase } = await requireUser();
  const { data } = await supabase.rpc("link_clicks", { p_since: since(days) });
  return Object.fromEntries(
    ((data ?? []) as { link_id: string; clicks: number }[]).map((row) => [row.link_id, Number(row.clicks)]),
  ) as Record<string, number>;
}
