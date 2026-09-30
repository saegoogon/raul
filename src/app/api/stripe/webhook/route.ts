import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { FULL_GAME_PRODUCT } from "@/lib/story/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhook is not set." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId =
      session.metadata?.userId ?? session.client_reference_id ?? null;
    const product = session.metadata?.product ?? FULL_GAME_PRODUCT;
    if (userId && session.payment_status === "paid") {
      const admin = createAdminClient();
      if (admin) {
        await admin.from("purchases").upsert(
          {
            user_id: userId,
            product,
          },
          { onConflict: "user_id,product" },
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
