"use server";

import { createClient } from "@/lib/supabase/server";
import { STORY_START, type StorySave } from "@/lib/story/types";

export async function saveStory(save: StorySave) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "login" as const };

    const nodeId =
      typeof save.nodeId === "string" && save.nodeId.length < 40
        ? save.nodeId
        : STORY_START;
    const flags = Array.isArray(save.flags)
      ? save.flags.filter((flag) => typeof flag === "string").slice(0, 20)
      : [];
    const meter = Math.max(0, Math.min(9, Number(save.meter) || 0));

    const { error } = await supabase.from("story_saves").upsert({
      user_id: user.id,
      node_id: nodeId,
      flags,
      meter,
      updated_at: new Date().toISOString(),
    });
    if (error) return { error: "setup" as const };
    return { ok: true as const };
  } catch {
    return { error: "setup" as const };
  }
}
