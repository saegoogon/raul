import { NextResponse } from "next/server";
import { publicOrigin } from "@/lib/public-origin";
import { getStripe } from "@/lib/stripe";
import { TRUE_NIGHT_PRODUCT } from "@/lib/story/types";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = getStripe();
  const price = process.env.STRIPE_TRUE_NIGHT_PRICE_ID;
  if (!stripe || !price) {
    return NextResponse.json(
      { error: "Payments are not connected yet. Add Stripe keys on Vercel." },
      { status: 501 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }

  const origin = publicOrigin(request);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/play?unlocked=1`,
    cancel_url: `${origin}/play`,
    client_reference_id: user.id,
    metadata: { userId: user.id, product: TRUE_NIGHT_PRODUCT },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
