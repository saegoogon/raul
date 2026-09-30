import { ShopPanel } from "@/components/ShopPanel";
import { FULL_GAME, stripePriceId, tossKeys } from "@/lib/pay";
import { getStripe } from "@/lib/stripe";
import { ownsFullGame } from "@/lib/story/progress";
import { getCurrentUser } from "@/lib/user";

export const metadata = {
  title: "Full Game",
};

async function stripeLabel() {
  const stripe = getStripe();
  const id = stripePriceId();
  if (!stripe || !id) return null;
  try {
    const price = await stripe.prices.retrieve(id);
    if (price.unit_amount == null) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency.toUpperCase(),
    }).format(price.unit_amount / 100);
  } catch {
    return null;
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; error?: string; pending?: string }>;
}) {
  const [query, user, owned, cardPrice] = await Promise.all([
    searchParams,
    getCurrentUser(),
    ownsFullGame(),
    stripeLabel(),
  ]);

  const status = query.done
    ? "done"
    : query.pending
      ? "pending"
      : query.error
        ? query.error.slice(0, 160)
        : null;

  return (
    <ShopPanel
      loggedIn={!!user}
      owned={owned}
      krw={FULL_GAME.krw}
      tossClientKey={tossKeys()?.client ?? null}
      cardPrice={cardPrice}
      status={status}
    />
  );
}
