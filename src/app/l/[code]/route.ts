import { NextResponse, type NextRequest } from "next/server";
import { isLinkScraper } from "@/lib/browser";
import { SLUG_PATTERN, deviceOf, referrerOf } from "@/lib/links";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET(request: NextRequest, { params }: RouteContext<"/l/[code]">) {
  const { code } = await params;
  if (!SLUG_PATTERN.test(code)) return NextResponse.redirect(new URL("/", request.url));

  const ua = request.headers.get("user-agent") ?? "";
  const { data: url } = await createPublicClient().rpc("follow_link", {
    p_slug: code,
    p_source: request.nextUrl.searchParams.get("s") === "page" ? "page" : "short",
    p_referrer: referrerOf(request.headers.get("referer"), request.nextUrl.hostname),
    p_country: request.headers.get("x-vercel-ip-country"),
    p_device: deviceOf(ua),
    p_count: !isLinkScraper(ua),
  });

  if (typeof url !== "string" || !url) {
    return NextResponse.redirect(new URL("/?missing=1", request.url));
  }
  const response = NextResponse.redirect(url, 307);
  response.headers.set("cache-control", "no-store");
  response.headers.set("referrer-policy", "no-referrer-when-downgrade");
  return response;
}
