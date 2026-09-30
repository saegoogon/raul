import { NextResponse } from "next/server";
import { FULL_GAME, stripePriceId } from "@/lib/pay";
import { publicOrigin } from "@/lib/public-origin";
import { getStripe } from "@/lib/stripe";
import { ownsFullGame } from "@/lib/story/progress";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = getStripe();
  const price = stripePriceId();
  if (!stripe || !price) {
    return NextResponse.json(
      { error: "Card payments are not connected yet." },
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
  if (await ownsFullGame()) {
    return NextResponse.json({ error: "You already own the full game." }, { status: 409 });
  }

  const origin = publicOrigin(request);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/pay/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop?error=${encodeURIComponent("Payment was canceled.")}`,
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    metadata: { userId: user.id, product: FULL_GAME.product },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
