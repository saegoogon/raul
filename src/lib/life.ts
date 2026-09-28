export const NIGHT_MS = 24 * 60 * 60 * 1000;

export function livingSince(now = new Date()) {
  return new Date(now.getTime() - NIGHT_MS);
}

export function isAlive(createdAt: string, now = Date.now()) {
  return now - new Date(createdAt).getTime() < NIGHT_MS;
}
