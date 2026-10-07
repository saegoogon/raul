"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { SearchProvider } from "@/components/search/SearchProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SearchProvider>{children}</SearchProvider>
    </CartProvider>
  );
}
