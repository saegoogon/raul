import { type NextRequest, NextResponse } from "next/server";
import { isLinkScraper } from "@/lib/browser";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === "blacksmile.co.kr") {
    return NextResponse.redirect(
      `https://www.blacksmile.co.kr${request.nextUrl.pathname}${request.nextUrl.search}`,
      301,
    );
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (isLinkScraper(ua)) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
