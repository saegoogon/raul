import { NextResponse } from "next/server";
import { publicOrigin } from "@/lib/public-origin";
import { createClient } from "@/lib/supabase/server";

function safeNext(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const oauthError = searchParams.get("error");
  const base = publicOrigin(request);

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
