import { createAdminClient } from "@/lib/supabase/admin";
import { ITEM_COLUMNS, type Crumb, type DriveItem } from "@/lib/drive";

const TOKEN = /^[A-Za-z0-9_-]{16,64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function item(admin: NonNullable<ReturnType<typeof createAdminClient>>, id: string) {
  const { data } = await admin
    .from("drive_items")
    .select(ITEM_COLUMNS)
    .eq("id", id)
    .is("trashed_at", null)
    .maybeSingle();
  return (data as DriveItem | null) ?? null;
}

export async function sharedRoot(token: string) {
  const admin = createAdminClient();
  if (!admin || !TOKEN.test(token)) return null;
  const { data } = await admin
    .from("drive_items")
    .select(ITEM_COLUMNS)
    .eq("share_token", token)
    .is("trashed_at", null)
    .maybeSingle();
  const root = (data as DriveItem | null) ?? null;
  return root ? { admin, root } : null;
}

export async function sharedItem(token: string, id: string | undefined) {
  const shared = await sharedRoot(token);
  if (!shared) return null;
  const { admin, root } = shared;
  if (!id || id === root.id) return { admin, root, target: root, crumbs: [] as Crumb[] };
  if (!UUID.test(id) || root.kind !== "folder") return null;

  const target = await item(admin, id);
  if (!target) return null;
  const crumbs: Crumb[] = [];
  let current: DriveItem | null = target;
  for (let depth = 0; current && depth < 32; depth += 1) {
    if (current.id === root.id) return { admin, root, target, crumbs };
    if (current.kind === "folder") crumbs.unshift({ id: current.id, name: current.name });
    current = current.parent_id ? await item(admin, current.parent_id) : null;
  }
  return null;
}
