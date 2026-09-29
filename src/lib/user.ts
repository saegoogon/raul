import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});

export const getProfile = cache(async (username: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, created_at")
      .eq("username", username)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
});
