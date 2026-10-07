"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductArt } from "@/components/product/ProductArt";
import { readOrders } from "@/lib/cart/storage";
import type { LocalOrder } from "@/lib/cart/types";
import { getProductById } from "@/lib/shop/catalog";
import { formatPrice } from "@/lib/shop/format";

export function AccountPanel({ email }: { email: string | null }) {
  const cart = useCart();
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    setOrders(readOrders());
  }, [cart.lines]);

  const saved = cart.saved
    .map((item) => getProductById(item.productId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="rail-head" style={{ border: 0, padding: 0 }}>
          Account
        </h2>
        {email ? <p>{email}</p> : <p className="mute">Browsing unnamed. Log in to keep this email on file.</p>}
        <div className="hero-actions" style={{ marginTop: 12 }}>
          {email ? null : (
            <>
              <Link href="/login" className="btn-primary">
                Log in
              </Link>
              <Link href="/signup" className="btn-ghost">
                Sign up
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="rail-head">Orders</h2>
        {orders.length ? (
          <ul className="search-list">
            {orders.map((order) => (
              <li key={order.id} className="cart-row" style={{ gridTemplateColumns: "1fr auto" }}>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("ko-KR")} · {order.lines.map((line) => line.name).join(", ")}
                </span>
                <span>{formatPrice(order.total)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mute">No tickets yet.</p>
        )}
      </section>

      <section>
        <h2 className="rail-head">
          <span>Bag</span>
          <Link href="/cart">Open</Link>
        </h2>
        <p className="mute">{cart.count ? `${cart.count} in the bag.` : "Empty."}</p>
      </section>

      <section>
        <h2 className="rail-head">Saved</h2>
        {saved.length ? (
          <div className="product-rail">
            {saved.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="product-card">
                <div className="product-card-art">
                  <ProductArt id={product.images[0].art} />
                </div>
                <span>{product.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mute">Nothing saved. Hearts live on this computer for now.</p>
        )}
      </section>
    </div>
  );
}
