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
  const image = formData.get("image") as File | null;
  const hasImage = Boolean(image && image.size > 0);

  if (!caption && !hasImage) return;

  let imageUrl: string | null = null;

  if (hasImage && image) {
    const ext = image.name.split(".").pop() || "jpg";
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

  const title = caption.slice(0, 80) || "Today";

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title,
    content: caption || null,
    image_url: imageUrl,
  });

  if (error) return;

  revalidatePath("/");
  redirect("/");
}
