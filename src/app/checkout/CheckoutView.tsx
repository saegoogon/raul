"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Grin } from "@/components/mascot/Grin";
import { lineKey, placeOrder } from "@/lib/cart/storage";
import type { CartLine } from "@/lib/cart/types";
import { getProductById } from "@/lib/shop/catalog";
import { formatPrice } from "@/lib/shop/format";

export function CheckoutView({
  mode,
  productId,
  option,
  qty,
}: {
  mode: string;
  productId: string;
  option: string;
  qty: number;
}) {
  const cart = useCart();
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo<CartLine[]>(() => {
    if (mode === "now" && productId) {
      return [{ key: lineKey(productId, option || null), productId, option: option || null, qty: Math.max(1, qty), selected: true }];
    }
    return cart.lines.filter((line) => line.selected);
  }, [cart.lines, mode, option, productId, qty]);

  const total = lines.reduce((sum, line) => {
    const product = getProductById(line.productId);
    return product ? sum + (product.salePrice ?? product.price) * line.qty : sum;
  }, 0);

  if (done) {
    return (
      <div className="empty">
        <Grin caption="The order is written down on this computer. No money moved." />
        <p className="lede">Ticket {done.slice(0, 8)}. Payment comes later, when the till is real.</p>
        <Link href="/account" className="btn-primary" style={{ marginTop: 16 }}>
          See orders
        </Link>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="empty">
        <p className="mute">Nothing selected.</p>
        <Link href="/cart" className="btn-ghost">
          Back to bag
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="search-list">
        {lines.map((line) => {
          const product = getProductById(line.productId);
          if (!product) return null;
          return (
            <li key={line.key} className="cart-row" style={{ gridTemplateColumns: "1fr auto" }}>
              <span>
                {product.name}
                {line.option ? ` · ${line.option}` : ""} × {line.qty}
              </span>
              <span>{formatPrice((product.salePrice ?? product.price) * line.qty)}</span>
            </li>
          );
        })}
      </ul>
      <div className="cart-summary">
        <p>{formatPrice(total)}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            try {
              const order = placeOrder(lines, "Catalog rehearsal. No payment.");
              setDone(order.id);
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not place that.");
            }
          }}
        >
          Place order
        </button>
      </div>
      <p className="fine">No card. No transfer. This checkout keeps a local ticket so the path is real.</p>
      {error ? <p className="text-warn">{error}</p> : null}
    </>
  );
}
