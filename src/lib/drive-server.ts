import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DRIVE_BUCKET, ITEM_COLUMNS, kindOf, type Crumb, type DriveItem } from "@/lib/drive";

export const requireDrive = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
});

export async function listFolder(parentId: string | null) {
  const { supabase } = await requireDrive();
  let query = supabase.from("drive_items").select(ITEM_COLUMNS).is("trashed_at", null);
  query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
  const { data } = await query
    .order("kind", { ascending: false })
    .order("name", { ascending: true });
  return (data ?? []) as DriveItem[];
}

export async function listTrash() {
  const { supabase } = await requireDrive();
  const { data } = await supabase
    .from("drive_items")
    .select(ITEM_COLUMNS)
    .not("trashed_at", "is", null)
    .order("trashed_at", { ascending: false });
  const items = (data ?? []) as DriveItem[];
  const trashed = new Map(items.map((item) => [item.id, item.trashed_at]));
  return items.filter(
    (item) => !item.parent_id || trashed.get(item.parent_id) !== item.trashed_at,
  );
}

export async function listRecent() {
  const { supabase } = await requireDrive();
  const { data } = await supabase
    .from("drive_items")
    .select(ITEM_COLUMNS)
    .eq("kind", "file")
    .is("trashed_at", null)
    .order("updated_at", { ascending: false })
    .limit(50);
  return (data ?? []) as DriveItem[];
}

export async function getFolder(id: string) {
  const { supabase } = await requireDrive();
  const { data } = await supabase
    .from("drive_items")
    .select(ITEM_COLUMNS)
    .eq("id", id)
    .eq("kind", "folder")
    .is("trashed_at", null)
    .maybeSingle();
  return (data as DriveItem | null) ?? null;
}

export async function crumbsFor(folder: DriveItem | null) {
  const { supabase } = await requireDrive();
  const crumbs: Crumb[] = [];
  let current = folder;
  for (let depth = 0; current && depth < 32; depth += 1) {
    crumbs.unshift({ id: current.id, name: current.name });
    if (!current.parent_id) break;
    const { data } = await supabase
      .from("drive_items")
      .select(ITEM_COLUMNS)
      .eq("id", current.parent_id)
      .maybeSingle();
    current = (data as DriveItem | null) ?? null;
  }
  return crumbs;
}

export async function usedBytes() {
  const { supabase } = await requireDrive();
  const { data } = await supabase.from("drive_items").select("size").eq("kind", "file");
  return (data ?? []).reduce((sum, row) => sum + Number(row.size ?? 0), 0);
}

export async function thumbnails(items: DriveItem[]) {
  const { supabase } = await requireDrive();
  const images = items.filter((item) => kindOf(item) === "image" && item.storage_path);
  if (!images.length) return {} as Record<string, string>;
  const { data } = await supabase.storage
    .from(DRIVE_BUCKET)
    .createSignedUrls(
      images.map((item) => item.storage_path!),
      60 * 60,
    );
  const byPath = new Map((data ?? []).map((row) => [row.path, row.signedUrl]));
  return Object.fromEntries(
    images
      .map((item) => [item.id, byPath.get(item.storage_path!)] as const)
      .filter((entry): entry is readonly [string, string] => !!entry[1]),
  );
}

export async function profileName() {
  const { supabase, user } = await requireDrive();
  const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
  return data?.username ?? user.email ?? "You";
}
