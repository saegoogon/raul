export function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

export const MAX_FILE_MB = 50;
