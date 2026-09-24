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

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const image = formData.get("image") as File | null;

  if (!title) return;

  let imageUrl: string | null = null;

  if (image && image.size > 0) {
    const ext = image.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(path, image);

    if (uploadError) return;

    const {
      data: { publicUrl },
    } = supabase.storage.from("posts").getPublicUrl(path);
    imageUrl = publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title,
    content,
    image_url: imageUrl,
  });

  if (error) return;

  revalidatePath("/");
  redirect("/");
}
