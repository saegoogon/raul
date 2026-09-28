export function tonightRange(now = new Date()) {
  const end = new Date(now.getTime() + 1000);
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return { start, end };
}
