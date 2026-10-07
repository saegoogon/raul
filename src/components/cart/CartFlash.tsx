"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function CartFlash() {
  const { flash } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!flash) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(id);
  }, [flash]);

  if (!flash || !visible) return null;
  return (
    <div className="cart-flash" role="status">
      {flash.text}
    </div>
  );
}
