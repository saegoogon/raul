"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CART_EVENT,
  addLine,
  cartCount,
  cartTotal,
  clearCart,
  readCart,
  readSaved,
  removeLine,
  selectAll,
  setLineQty,
  toggleSaved,
  toggleSelect,
} from "@/lib/cart/storage";
import type { CartLine, SavedItem } from "@/lib/cart/types";

type Flash = { text: string; at: number } | null;

type CartContextValue = {
  ready: boolean;
  lines: CartLine[];
  saved: SavedItem[];
  count: number;
  total: number;
  selectedTotal: number;
  flash: Flash;
  add: (productId: string, option: string | null, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  toggle: (key: string) => void;
  all: (selected: boolean) => void;
  empty: () => void;
  save: (productId: string) => void;
  isSaved: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [flash, setFlash] = useState<Flash>(null);

  const refresh = useCallback(() => {
    setLines(readCart());
    setSaved(readSaved());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    window.addEventListener(CART_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const value = useMemo<CartContextValue>(
    () => ({
      ready,
      lines,
      saved,
      count: cartCount(lines),
      total: cartTotal(lines),
      selectedTotal: cartTotal(lines, true),
      flash,
      add: (productId, option, qty = 1) => {
        try {
          setLines(addLine(productId, option, qty));
          setFlash({ text: "In the bag.", at: Date.now() });
        } catch (error) {
          setFlash({ text: error instanceof Error ? error.message : "Could not add that.", at: Date.now() });
        }
      },
      setQty: (key, qty) => setLines(setLineQty(key, qty)),
      remove: (key) => setLines(removeLine(key)),
      toggle: (key) => setLines(toggleSelect(key)),
      all: (selected) => setLines(selectAll(selected)),
      empty: () => setLines(clearCart()),
      save: (productId) => setSaved(toggleSaved(productId)),
      isSaved: (productId) => saved.some((item) => item.productId === productId),
    }),
    [flash, lines, ready, saved],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart needs CartProvider");
  return ctx;
}
