"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/Icon";
import { Price } from "@/components/product/Price";
import { SaveButton } from "@/components/product/SaveButton";
import type { Product } from "@/lib/shop/types";

export function ProductBuy({ product }: { product: Product }) {
  const cart = useCart();
  const router = useRouter();
  const first = product.options[0];
  const [option, setOption] = useState(first?.values[0] ?? null);
  const [qty, setQty] = useState(1);
  const sold = product.stock <= 0;
  const max = Math.max(1, product.stock);

  const optionLabel = first?.name;
  const chosen = useMemo(() => (first ? option : null), [first, option]);

  return (
    <div className="buy-block">
      <div className="flex items-start justify-between gap-4">
        <h1>{product.name}</h1>
        <SaveButton productId={product.id} />
      </div>
      <Price price={product.price} salePrice={product.salePrice} />
      <p className="lede">{product.description}</p>

      {first ? (
        <div>
          <p className="mute" style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {optionLabel}
          </p>
          <div className="option-row">
            {first.values.map((value) => (
              <button key={value} type="button" className={option === value ? "is-on" : ""} onClick={() => setOption(value)}>
                {value}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="qty">
        <button type="button" className="icon-btn" aria-label="Less" disabled={sold} onClick={() => setQty((n) => Math.max(1, n - 1))}>
          <Icon name="minus" size={16} />
        </button>
        <span>{qty}</span>
        <button type="button" className="icon-btn" aria-label="More" disabled={sold} onClick={() => setQty((n) => Math.min(max, n + 1))}>
          <Icon name="plus" size={16} />
        </button>
      </div>

      <div className="buy-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={sold}
          onClick={() => cart.add(product.id, chosen, qty)}
        >
          {sold ? "Sold out" : "Add to bag"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={sold}
          onClick={() => {
            const query = new URLSearchParams({ mode: "now", product: product.id, qty: String(qty) });
            if (chosen) query.set("option", chosen);
            router.push(`/checkout?${query.toString()}`);
          }}
        >
          Buy now
        </button>
      </div>

      <div className="fine">
        <p>{product.details}</p>
        <p>{product.shipping}</p>
        <p>BlackSmile piece. Not a copy of another brand.</p>
      </div>
    </div>
  );
}
