"use server";

import { revalidatePath } from "next/cache";
import { livingSince } from "@/lib/life";
import { createClient } from "@/lib/supabase/server";

const WAIT_MS = 1500;
const MAX_WINKS = 80;

export async function winkTonight() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "login" as const };

  const since = livingSince().toISOString();
  const { count } = await supabase
    .from("winks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  if ((count ?? 0) >= MAX_WINKS) return { error: "limit" as const };

  const { data: last } = await supabase
    .from("winks")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last && Date.now() - new Date(last.created_at).getTime() < WAIT_MS) {
    return { error: "wait" as const };
  }

  const { error } = await supabase.from("winks").insert({ user_id: user.id });
  if (error) return { error: "setup" as const };

  revalidatePath("/");
  revalidatePath("/rank");
  return { ok: true as const };
}
