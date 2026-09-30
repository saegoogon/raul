import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { OWNED_PRODUCTS, type StorySave } from "@/lib/story/types";

export const getStorySave = cache(async (): Promise<StorySave | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("story_saves")
      .select("node_id, flags, meter")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return null;
    return {
      nodeId: data.node_id,
      flags: Array.isArray(data.flags) ? data.flags : [],
      meter: data.meter ?? 0,
    };
  } catch {
    return null;
  }
});

export const ownsFullGame = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .in("product", OWNED_PRODUCTS)
      .limit(1);
    return !error && !!data?.length;
  } catch {
    return false;
  }
});
