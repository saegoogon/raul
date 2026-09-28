import { NextResponse } from "next/server";
import { getNaverConfig, NAVER_STATE_COOKIE, naverAuthorizeUrl } from "@/lib/naver";
import { publicOrigin } from "@/lib/public-origin";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const config = getNaverConfig();
  if (!config) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const state = crypto.randomUUID();
  const redirectUri = `${origin}/auth/naver/callback`;
  const response = NextResponse.redirect(
    naverAuthorizeUrl(config.clientId, redirectUri, state),
  );
  response.cookies.set(NAVER_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 600,
    path: "/",
  });
  return response;
}
