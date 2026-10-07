"use client";

import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/Icon";

export function SaveButton({ productId }: { productId: string }) {
  const cart = useCart();
  const on = cart.isSaved(productId);
  return (
    <button type="button" className="icon-btn" aria-pressed={on} aria-label={on ? "Remove from saved" : "Save"} onClick={() => cart.save(productId)}>
      <Icon name="heart" size={18} />
    </button>
  );
}
