"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/Icon";
import { Grin } from "@/components/mascot/Grin";
import { ProductArt } from "@/components/product/ProductArt";
import { getProductById } from "@/lib/shop/catalog";
import { activePrice, formatPrice } from "@/lib/shop/format";

export function CartView() {
  const cart = useCart();

  if (!cart.ready) return <p className="mute">Opening the bag…</p>;

  if (!cart.lines.length) {
    return (
      <div className="empty">
        <Grin caption="The bag is empty. It is not offended. Yet." />
        <Link href="/shop" className="btn-primary" style={{ marginTop: 16 }}>
          Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="shop-tools">
        <button type="button" onClick={() => cart.all(true)}>
          Select all
        </button>
        <button type="button" onClick={() => cart.all(false)}>
          Select none
        </button>
        <button type="button" onClick={cart.empty}>
          Empty bag
        </button>
      </div>
      <div className="cart-table">
        {cart.lines.map((line) => {
          const product = getProductById(line.productId);
          if (!product) return null;
          const unit = activePrice(product.price, product.salePrice);
          return (
            <div key={line.key} className="cart-row">
              <input type="checkbox" checked={line.selected} onChange={() => cart.toggle(line.key)} aria-label={`Select ${product.name}`} />
              <Link href={`/product/${product.slug}`} className="cart-thumb">
                <ProductArt id={product.images[0].art} />
              </Link>
              <div>
                <Link href={`/product/${product.slug}`}>{product.name}</Link>
                {line.option ? <p className="mute">{line.option}</p> : null}
                <div className="qty">
                  <button type="button" className="icon-btn" aria-label="Less" onClick={() => cart.setQty(line.key, line.qty - 1)}>
                    <Icon name="minus" size={16} />
                  </button>
                  <span>{line.qty}</span>
                  <button type="button" className="icon-btn" aria-label="More" onClick={() => cart.setQty(line.key, line.qty + 1)}>
                    <Icon name="plus" size={16} />
                  </button>
                </div>
              </div>
              <div>
                <p>{formatPrice(unit * line.qty)}</p>
                <button type="button" className="btn-ghost" onClick={() => cart.remove(line.key)}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="cart-summary">
        <p>
          Selected {formatPrice(cart.selectedTotal)}
          <span className="mute"> · bag {formatPrice(cart.total)}</span>
        </p>
        <Link href="/checkout" className={`btn-primary${cart.selectedTotal ? "" : " pointer-events-none opacity-50"}`}>
          Checkout
        </Link>
      </div>
    </>
  );
}
