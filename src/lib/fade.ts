export function fadeForAge(dateStr: string, now = Date.now()) {
  const hours = (now - new Date(dateStr).getTime()) / 3_600_000;
  const t = Math.min(Math.max(hours / 12, 0), 1);
  return 1 - t * 0.6;
}
