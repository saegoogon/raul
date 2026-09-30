export const DRIVE_BUCKET = "drive";
export const QUOTA_BYTES = 1024 * 1024 * 1024;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export type DriveItem = {
  id: string;
  parent_id: string | null;
  kind: "folder" | "file";
  name: string;
  size: number;
  mime: string | null;
  storage_path: string | null;
  share_token: string | null;
  trashed_at: string | null;
  updated_at: string;
};

export type Crumb = { id: string; name: string };

export const ITEM_COLUMNS =
  "id, parent_id, kind, name, size, mime, storage_path, share_token, trashed_at, updated_at";

export type FileKind = "folder" | "image" | "video" | "audio" | "pdf" | "text" | "archive" | "file";

export function kindOf(item: Pick<DriveItem, "kind" | "mime" | "name">): FileKind {
  if (item.kind === "folder") return "folder";
  const mime = item.mime ?? "";
  const ext = item.name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("text/") || ["md", "json", "csv", "txt", "log"].includes(ext)) return "text";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  return "file";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

export function cleanName(raw: string) {
  return raw.replace(/[\\/\u0000-\u001f]/g, "").trim().slice(0, 255);
}
