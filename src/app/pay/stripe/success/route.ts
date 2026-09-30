import { NextResponse } from "next/server";
import { FULL_GAME, grantFullGame } from "@/lib/pay";
import { publicOrigin } from "@/lib/public-origin";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const back = (query: string) => NextResponse.redirect(new URL(`/shop?${query}`, origin));

  const sessionId = new URL(request.url).searchParams.get("session_id");
  const stripe = getStripe();
  const admin = createAdminClient();
  if (!sessionId || !stripe || !admin) return back("pending=1");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata?.userId ?? session.client_reference_id;
    if (session.payment_status !== "paid" || !userId) return back("pending=1");

    await admin.from("payment_orders").upsert(
      {
        id: session.id,
        user_id: userId,
        product: session.metadata?.product ?? FULL_GAME.product,
        provider: "stripe",
        amount: session.amount_total ?? 0,
        currency: (session.currency ?? "usd").toUpperCase(),
        status: "paid",
        payment_key: typeof session.payment_intent === "string" ? session.payment_intent : null,
        paid_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    await grantFullGame(admin, userId);
    return back("done=1");
  } catch {
    return back("pending=1");
  }
}
