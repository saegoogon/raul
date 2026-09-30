import { NextResponse } from "next/server";
import { publicOrigin } from "@/lib/public-origin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const code = url.searchParams.get("code");
  const message =
    code === "PAY_PROCESS_CANCELED"
      ? "Payment was canceled."
      : (url.searchParams.get("message") ?? "Payment failed.");

  const admin = createAdminClient();
  if (admin && orderId) {
    await admin
      .from("payment_orders")
      .update({ status: "failed" })
      .eq("id", orderId)
      .eq("status", "pending");
  }

  return NextResponse.redirect(
    new URL(`/shop?error=${encodeURIComponent(message)}`, publicOrigin(request)),
  );
}
