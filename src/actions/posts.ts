"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const caption = (formData.get("caption") as string)?.trim() || "";
  const mediaUrl = (formData.get("mediaUrl") as string)?.trim() || null;

  if (!caption && !mediaUrl) return { error: "Add a photo, a short, or a caption." };

  const title = caption.slice(0, 80) || (mediaUrl ? "Today" : "Today");

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title,
    content: caption || null,
    image_url: mediaUrl,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/rank");
  redirect("/");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/rank");
  redirect("/");
}
