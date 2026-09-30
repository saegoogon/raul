import { NextResponse } from "next/server";
import { confirmToss, grantFullGame, tossKeys } from "@/lib/pay";
import { publicOrigin } from "@/lib/public-origin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const back = (query: string) => NextResponse.redirect(new URL(`/shop?${query}`, origin));
  const fail = (message: string) => back(`error=${encodeURIComponent(message)}`);

  const url = new URL(request.url);
  const paymentKey = url.searchParams.get("paymentKey");
  const orderId = url.searchParams.get("orderId");
  const amount = Number(url.searchParams.get("amount"));
  const keys = tossKeys();
  const admin = createAdminClient();
  if (!keys || !admin) return fail("Toss payments are not connected yet.");
  if (!paymentKey || !orderId || !Number.isFinite(amount)) return fail("Missing payment details.");

  const { data: order } = await admin
    .from("payment_orders")
    .select("id, user_id, amount, status")
    .eq("id", orderId)
    .eq("provider", "toss")
    .maybeSingle();
  if (!order) return fail("Order not found.");
  if (order.status === "paid") return back("done=1");
  if (order.amount !== amount) {
    await admin.from("payment_orders").update({ status: "failed" }).eq("id", orderId);
    return fail("The payment amount did not match.");
  }

  const result = await confirmToss(keys.secret, { paymentKey, orderId, amount });
  if (!result.ok) {
    await admin
      .from("payment_orders")
      .update({ status: "failed", payment_key: paymentKey })
      .eq("id", orderId);
    return fail(result.message);
  }

  await admin
    .from("payment_orders")
    .update({ status: "paid", payment_key: paymentKey, paid_at: new Date().toISOString() })
    .eq("id", orderId);
  await grantFullGame(admin, order.user_id);
  return back("done=1");
}
