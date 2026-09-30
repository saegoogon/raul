import type { SupabaseClient } from "@supabase/supabase-js";
import { FULL_GAME_PRODUCT } from "@/lib/story/types";

export const FULL_GAME = {
  product: FULL_GAME_PRODUCT,
  name: "BlackSmile Full Game",
  krw: Number(process.env.FULL_GAME_PRICE_KRW ?? 9900),
};

export type Provider = "toss" | "stripe";

export function tossKeys() {
  const client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  const secret = process.env.TOSS_SECRET_KEY;
  return client && secret ? { client, secret } : null;
}

export function stripePriceId() {
  return process.env.STRIPE_FULL_GAME_PRICE_ID ?? process.env.STRIPE_TRUE_NIGHT_PRICE_ID ?? null;
}

export async function grantFullGame(admin: SupabaseClient, userId: string) {
  const { error } = await admin
    .from("purchases")
    .upsert({ user_id: userId, product: FULL_GAME.product }, { onConflict: "user_id,product" });
  return !error;
}

type TossPayment = { status?: string; totalAmount?: number; orderId?: string; message?: string; code?: string };

export async function confirmToss(
  secret: string,
  body: { paymentKey: string; orderId: string; amount: number },
) {
  const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${secret}:`).toString("base64")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": body.orderId,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as TossPayment;
  const ok =
    response.ok &&
    data.status === "DONE" &&
    data.totalAmount === body.amount &&
    data.orderId === body.orderId;
  return { ok, message: data.message ?? "Payment could not be confirmed." };
}
