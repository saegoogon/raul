import { NextResponse } from "next/server";
import { FULL_GAME, tossKeys } from "@/lib/pay";
import { ownsFullGame } from "@/lib/story/progress";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const keys = tossKeys();
  const admin = createAdminClient();
  if (!keys || !admin) {
    return NextResponse.json(
      { error: "Toss payments are not connected yet." },
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

  const orderId = `bs-${crypto.randomUUID()}`;
  const { error } = await admin.from("payment_orders").insert({
    id: orderId,
    user_id: user.id,
    product: FULL_GAME.product,
    provider: "toss",
    amount: FULL_GAME.krw,
    currency: "KRW",
  });
  if (error) {
    return NextResponse.json({ error: "Could not create the order." }, { status: 500 });
  }

  return NextResponse.json({
    orderId,
    amount: FULL_GAME.krw,
    orderName: FULL_GAME.name,
    customerKey: user.id,
    customerEmail: user.email ?? null,
  });
}
