"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function vote(postId: string, value: 1 | -1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("votes")
    .select("id, value")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existing) {
    if (existing.value === value) {
      await supabase.from("votes").delete().eq("id", existing.id);
    } else {
      await supabase.from("votes").update({ value }).eq("id", existing.id);
    }
  } else {
    await supabase.from("votes").insert({
      user_id: user.id,
      post_id: postId,
      value,
    });
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
}
