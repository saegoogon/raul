import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  emailFromNaver,
  exchangeNaverCode,
  fetchNaverProfile,
  getNaverConfig,
  NAVER_STATE_COOKIE,
  usernameFromNaver,
} from "@/lib/naver";
import { publicOrigin } from "@/lib/public-origin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const failUrl = `${origin}/login?error=oauth`;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const config = getNaverConfig();
  const env = getSupabaseEnv();
  const cookieStore = await cookies();
  const savedState = cookieStore.get(NAVER_STATE_COOKIE)?.value;

  const finish = (
    url: string,
    extra: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[] = [],
  ) => {
    const response = NextResponse.redirect(url);
    extra.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    response.cookies.set(NAVER_STATE_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  };

  if (oauthError || !code || !state || !config || !env || !savedState || savedState !== state) {
    return finish(failUrl);
  }

  try {
    const accessToken = await exchangeNaverCode(
      config.clientId,
      config.clientSecret,
      code,
      state,
    );
    const profile = await fetchNaverProfile(accessToken);
    const email = emailFromNaver(profile);
    const admin = createAdminClient();
    if (!admin) return finish(failUrl);

    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        username: usernameFromNaver(profile),
        nickname: profile.nickname ?? "",
        name: profile.name ?? "",
        avatar_url: profile.profile_image ?? "",
        naver_id: profile.id,
        provider: "naver",
      },
    });

    if (
      created.error &&
      !/already|registered|exists/i.test(created.error.message)
    ) {
      return finish(failUrl);
    }

    const link = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = link.data.properties?.hashed_token;
    if (link.error || !tokenHash) return finish(failUrl);

    const pending: {
      name: string;
      value: string;
      options?: Parameters<typeof cookieStore.set>[2];
    }[] = [];

    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            pending.push({ name, value, options });
          });
        },
      },
    });

    const verified = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: tokenHash,
    });
    if (verified.error) return finish(failUrl);

    return finish(`${origin}/`, pending);
  } catch {
    return finish(failUrl);
  }
}
