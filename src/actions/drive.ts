"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  DRIVE_BUCKET,
  MAX_FILE_BYTES,
  QUOTA_BYTES,
  cleanName,
  type DriveItem,
} from "@/lib/drive";

type Result<T = null> = { ok: true; data: T } | { ok: false; error: string };

async function session() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

type Session = NonNullable<Awaited<ReturnType<typeof session>>>;

function done<T>(data: T): Result<T> {
  revalidatePath("/drive", "layout");
  return { ok: true, data };
}

async function ownedFolder(ctx: Session, id: string | null) {
  if (!id) return true;
  const { data } = await ctx.supabase
    .from("drive_items")
    .select("id")
    .eq("id", id)
    .eq("kind", "folder")
    .is("trashed_at", null)
    .maybeSingle();
  return !!data;
}

async function usage(ctx: Session) {
  const { data } = await ctx.supabase.from("drive_items").select("size").eq("kind", "file");
  return (data ?? []).reduce((sum, row) => sum + Number(row.size ?? 0), 0);
}

async function uniqueName(ctx: Session, parentId: string | null, name: string, skipId?: string) {
  let query = ctx.supabase.from("drive_items").select("id, name").is("trashed_at", null);
  query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
  const { data } = await query;
  const taken = new Set(
    (data ?? []).filter((row) => row.id !== skipId).map((row) => row.name.toLowerCase()),
  );
  if (!taken.has(name.toLowerCase())) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${stem} (${n})${ext}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  return `${stem} (${Date.now()})${ext}`;
}

export async function createFolder(parentId: string | null, rawName: string): Promise<Result<string>> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const name = cleanName(rawName);
  if (!name) return { ok: false, error: "Give the folder a name." };
  if (!(await ownedFolder(ctx, parentId))) return { ok: false, error: "Folder not found." };

  const { data, error } = await ctx.supabase
    .from("drive_items")
    .insert({
      owner_id: ctx.user.id,
      parent_id: parentId,
      kind: "folder",
      name: await uniqueName(ctx, parentId, name),
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "Could not create the folder." };
  return done(data.id);
}

export type UploadTicket = { id: string; path: string; name: string };

export async function prepareUpload(
  parentId: string | null,
  files: { name: string; size: number }[],
): Promise<Result<UploadTicket[]>> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  if (!files.length) return { ok: false, error: "No files selected." };
  if (!(await ownedFolder(ctx, parentId))) return { ok: false, error: "Folder not found." };

  const tooBig = files.find((file) => file.size > MAX_FILE_BYTES);
  if (tooBig) return { ok: false, error: `${tooBig.name} is over the 50 MB file limit.` };
  const incoming = files.reduce((sum, file) => sum + file.size, 0);
  if ((await usage(ctx)) + incoming > QUOTA_BYTES) {
    return { ok: false, error: "Not enough storage left for these files." };
  }

  return {
    ok: true,
    data: files.map((file) => {
      const id = randomUUID();
      return { id, path: `${ctx.user.id}/${id}`, name: cleanName(file.name) || "Untitled" };
    }),
  };
}

export async function commitUpload(
  parentId: string | null,
  file: { id: string; path: string; name: string; size: number; mime: string },
): Promise<Result<DriveItem["id"]>> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  if (file.path !== `${ctx.user.id}/${file.id}`) return { ok: false, error: "Invalid upload." };
  if (!(await ownedFolder(ctx, parentId))) return { ok: false, error: "Folder not found." };

  const { data: stored } = await ctx.supabase.storage
    .from(DRIVE_BUCKET)
    .list(ctx.user.id, { search: file.id, limit: 1 });
  const object = stored?.find((entry) => entry.name === file.id);
  if (!object) return { ok: false, error: "Upload did not finish." };
  const size = Number(object.metadata?.size ?? file.size);
  if ((await usage(ctx)) + size > QUOTA_BYTES) {
    await ctx.supabase.storage.from(DRIVE_BUCKET).remove([file.path]);
    return { ok: false, error: "Not enough storage left for this file." };
  }

  const { error } = await ctx.supabase.from("drive_items").insert({
    id: file.id,
    owner_id: ctx.user.id,
    parent_id: parentId,
    kind: "file",
    name: await uniqueName(ctx, parentId, cleanName(file.name) || "Untitled"),
    size: Math.max(0, Math.round(size)),
    mime: file.mime || null,
    storage_path: file.path,
  });
  if (error) {
    await ctx.supabase.storage.from(DRIVE_BUCKET).remove([file.path]);
    return { ok: false, error: "Could not save the file." };
  }
  return done(file.id);
}

export async function renameItem(id: string, rawName: string): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const name = cleanName(rawName);
  if (!name) return { ok: false, error: "Name cannot be empty." };
  const { data: item } = await ctx.supabase
    .from("drive_items")
    .select("id, parent_id")
    .eq("id", id)
    .maybeSingle();
  if (!item) return { ok: false, error: "Item not found." };

  const { error } = await ctx.supabase
    .from("drive_items")
    .update({
      name: await uniqueName(ctx, item.parent_id, name, id),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: "Could not rename." };
  return done(null);
}

async function descendants(ctx: Session, id: string) {
  const all: string[] = [id];
  let frontier = [id];
  for (let depth = 0; frontier.length && depth < 64; depth += 1) {
    const { data } = await ctx.supabase.from("drive_items").select("id").in("parent_id", frontier);
    frontier = (data ?? []).map((row) => row.id);
    all.push(...frontier);
  }
  return all;
}

export async function moveItems(ids: string[], targetId: string | null): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  if (!(await ownedFolder(ctx, targetId))) return { ok: false, error: "Folder not found." };
  if (targetId) {
    for (const id of ids) {
      if ((await descendants(ctx, id)).includes(targetId)) {
        return { ok: false, error: "A folder cannot move inside itself." };
      }
    }
  }
  for (const id of ids) {
    const { data: item } = await ctx.supabase
      .from("drive_items")
      .select("name")
      .eq("id", id)
      .maybeSingle();
    if (!item) continue;
    await ctx.supabase
      .from("drive_items")
      .update({
        parent_id: targetId,
        name: await uniqueName(ctx, targetId, item.name, id),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  }
  return done(null);
}

export async function trashItems(ids: string[]): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const stamp = new Date().toISOString();
  for (const id of ids) {
    const { error } = await ctx.supabase
      .from("drive_items")
      .update({ trashed_at: stamp, share_token: null })
      .in("id", await descendants(ctx, id))
      .is("trashed_at", null);
    if (error) return { ok: false, error: "Could not move to trash." };
  }
  return done(null);
}

export async function restoreItems(ids: string[]): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  for (const id of ids) {
    const { data: item } = await ctx.supabase
      .from("drive_items")
      .select("parent_id, name, trashed_at")
      .eq("id", id)
      .maybeSingle();
    if (!item?.trashed_at) continue;
    const parentAlive = await ownedFolder(ctx, item.parent_id);
    const parentId = parentAlive ? item.parent_id : null;
    await ctx.supabase
      .from("drive_items")
      .update({
        trashed_at: null,
        parent_id: parentId,
        name: await uniqueName(ctx, parentId, item.name, id),
      })
      .eq("id", id);
    const inside = (await descendants(ctx, id)).filter((child) => child !== id);
    if (inside.length) {
      await ctx.supabase
        .from("drive_items")
        .update({ trashed_at: null })
        .in("id", inside)
        .eq("trashed_at", item.trashed_at);
    }
  }
  return done(null);
}

export async function deleteForever(ids: string[]): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const every = new Set<string>();
  for (const id of ids) for (const child of await descendants(ctx, id)) every.add(child);
  const list = [...every];
  const { data } = await ctx.supabase
    .from("drive_items")
    .select("storage_path")
    .in("id", list)
    .not("storage_path", "is", null);
  const paths = (data ?? []).map((row) => row.storage_path as string);
  for (let i = 0; i < paths.length; i += 100) {
    await ctx.supabase.storage.from(DRIVE_BUCKET).remove(paths.slice(i, i + 100));
  }
  const { error } = await ctx.supabase.from("drive_items").delete().in("id", ids);
  if (error) return { ok: false, error: "Could not delete." };
  return done(null);
}

export async function emptyTrash(): Promise<Result> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const { data } = await ctx.supabase
    .from("drive_items")
    .select("id")
    .not("trashed_at", "is", null);
  const ids = (data ?? []).map((row) => row.id);
  if (!ids.length) return done(null);
  return deleteForever(ids);
}

export async function fileUrl(id: string, download: boolean): Promise<Result<string>> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const { data: item } = await ctx.supabase
    .from("drive_items")
    .select("name, storage_path")
    .eq("id", id)
    .eq("kind", "file")
    .maybeSingle();
  if (!item?.storage_path) return { ok: false, error: "File not found." };
  const { data, error } = await ctx.supabase.storage
    .from(DRIVE_BUCKET)
    .createSignedUrl(item.storage_path, 60 * 10, download ? { download: item.name } : undefined);
  if (error || !data) return { ok: false, error: "Could not open the file." };
  return { ok: true, data: data.signedUrl };
}

export async function setShare(id: string, on: boolean): Promise<Result<string | null>> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const token = on ? randomBytes(16).toString("base64url") : null;
  const { data, error } = await ctx.supabase
    .from("drive_items")
    .update({ share_token: token })
    .eq("id", id)
    .is("trashed_at", null)
    .select("share_token")
    .maybeSingle();
  if (error || !data) return { ok: false, error: "Could not update sharing." };
  return done(data.share_token);
}

export async function listFolders(): Promise<Result<{ id: string; name: string; parent_id: string | null }[]>> {
  const ctx = await session();
  if (!ctx) return { ok: false, error: "Log in first." };
  const { data } = await ctx.supabase
    .from("drive_items")
    .select("id, name, parent_id")
    .eq("kind", "folder")
    .is("trashed_at", null)
    .order("name");
  return { ok: true, data: data ?? [] };
}
