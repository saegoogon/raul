const AUTHORIZE_URL = "https://nid.naver.com/oauth2.0/authorize";
const TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

export const NAVER_STATE_COOKIE = "bs_naver_state";

export type NaverProfile = {
  id: string;
  email?: string;
  nickname?: string;
  name?: string;
  profile_image?: string;
};

export function getNaverConfig() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function naverAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  state: string,
) {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeNaverCode(
  clientId: string,
  clientSecret: string,
  code: string,
  state: string,
) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    state,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error ?? "Naver token exchange failed");
  }

  return data.access_token;
}

export async function fetchNaverProfile(accessToken: string): Promise<NaverProfile> {
  const response = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await response.json()) as {
    resultcode?: string;
    response?: NaverProfile;
  };

  if (!response.ok || data.resultcode !== "00" || !data.response?.id) {
    throw new Error("Naver profile fetch failed");
  }

  return data.response;
}

export function emailFromNaver(profile: NaverProfile) {
  if (profile.email?.includes("@")) return profile.email.toLowerCase();
  return `naver.${profile.id}@users.blacksmile.invalid`;
}

export function usernameFromNaver(profile: NaverProfile) {
  const raw =
    profile.nickname ||
    profile.name ||
    profile.email?.split("@")[0] ||
    `user${profile.id.slice(0, 8)}`;
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (cleaned.length >= 3) return cleaned.slice(0, 20);
  return `user${profile.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`.slice(0, 20);
}
