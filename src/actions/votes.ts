"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setLike(postId: string, liked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "login" as const };

  const { data: existing } = await supabase
    .from("votes")
    .select("id, value")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (liked) {
    if (!existing) {
      await supabase.from("votes").insert({
        user_id: user.id,
        post_id: postId,
        value: 1,
      });
    } else if (existing.value !== 1) {
      await supabase.from("votes").update({ value: 1 }).eq("id", existing.id);
    }
  } else if (existing) {
    await supabase.from("votes").delete().eq("id", existing.id);
  }

  revalidatePath("/");
  revalidatePath("/rank");
  return { ok: true as const };
}
