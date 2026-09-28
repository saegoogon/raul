import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function redirectBase(request: Request, origin: string) {
  const host = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (process.env.NODE_ENV !== "development" && host) {
    return `${proto}://${host}`;
  }
  return origin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const oauthError = searchParams.get("error");
  const base = redirectBase(request, origin);

  if (oauthError) {
    return NextResponse.redirect(`${base}/login?error=oauth`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${base}${next}`);
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.redirect(`${base}/login?error=oauth`);
}
