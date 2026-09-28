import { NIGHT_MS } from "@/lib/life";

export function timeAgo(dateStr: string, now = Date.now()) {
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function timeLeft(dateStr: string, now = Date.now()) {
  const remaining = NIGHT_MS - (now - new Date(dateStr).getTime());
  if (remaining <= 0) return "gone";
  const minutes = Math.floor(remaining / 60000);
  if (minutes < 1) return "almost gone";
  if (minutes < 60) return `${minutes}m left`;
  return `${Math.floor(minutes / 60)}h left`;
}
