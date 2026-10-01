export const SITE = "https://www.blacksmile.co.kr";
export const SHORT_PREFIX = "/l/";

export type LinkRow = {
  id: string;
  slug: string;
  url: string;
  title: string;
  on_page: boolean;
  active: boolean;
  position: number;
  created_at: string;
};

export type Profile = { username: string; display_name: string; bio: string };

export type PublicPage = Profile & { links: { slug: string; title: string; url: string }[] };

export const LINK_COLUMNS = "id, slug, url, title, on_page, active, position, created_at";

export const SLUG_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomSlug(length = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    const href = url.toString();
    return href.length <= 2048 ? href : null;
  } catch {
    return null;
  }
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function shortUrl(slug: string) {
  return `${SITE.replace(/^https?:\/\//, "")}${SHORT_PREFIX}${slug}`;
}

export function deviceOf(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "Tablet";
  if (/mobi|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function referrerOf(header: string | null, ownHost: string) {
  if (!header) return null;
  try {
    const host = new URL(header).hostname.replace(/^www\./, "");
    return host === ownHost.replace(/^www\./, "") ? null : host;
  } catch {
    return null;
  }
}

export const RANGES = { "7": 7, "30": 30, "90": 90 } as const;
export type RangeKey = keyof typeof RANGES;
