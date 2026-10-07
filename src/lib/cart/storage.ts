import { getProductById } from "@/lib/shop/catalog";
import { activePrice } from "@/lib/shop/format";
import type { CartLine, LocalOrder, SavedItem } from "@/lib/cart/types";

export const CART_KEY = "blacksmile.cart.v1";
export const SAVED_KEY = "blacksmile.saved.v1";
export const ORDERS_KEY = "blacksmile.orders.v1";
export const CART_EVENT = "blacksmile:cart";

function store() {
  if (typeof window === "undefined") return null;
  try {
    window.localStorage.setItem("blacksmile.probe", "1");
    window.localStorage.removeItem("blacksmile.probe");
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
}

function readJson<T>(key: string, fallback: T): T {
  const bucket = store();
  if (!bucket) return fallback;
  try {
    const raw = bucket.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  const bucket = store();
  if (bucket) {
    try {
      bucket.setItem(key, JSON.stringify(value));
    } catch {
      // private mode may still refuse writes
    }
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

export function lineKey(productId: string, option: string | null) {
  return `${productId}::${option ?? ""}`;
}

export function readCart(): CartLine[] {
  return readJson<CartLine[]>(CART_KEY, []);
}

export function readSaved(): SavedItem[] {
  return readJson<SavedItem[]>(SAVED_KEY, []);
}

export function readOrders(): LocalOrder[] {
  return readJson<LocalOrder[]>(ORDERS_KEY, []);
}

export function addLine(productId: string, option: string | null, qty: number) {
  const product = getProductById(productId);
  if (!product || product.stock <= 0) throw new Error("That piece is gone.");
  const key = lineKey(productId, option);
  const lines = readCart();
  const existing = lines.find((line) => line.key === key);
  const nextQty = Math.min(product.stock, (existing?.qty ?? 0) + qty);
  const next = existing
    ? lines.map((line) => (line.key === key ? { ...line, qty: nextQty } : line))
    : [...lines, { key, productId, option, qty: nextQty, selected: true }];
  writeJson(CART_KEY, next);
  return next;
}

export function setLineQty(key: string, qty: number) {
  const lines = readCart();
  const line = lines.find((item) => item.key === key);
  if (!line) return lines;
  const product = getProductById(line.productId);
  const max = product?.stock ?? 1;
  if (qty <= 0) {
    const next = lines.filter((item) => item.key !== key);
    writeJson(CART_KEY, next);
    return next;
  }
  const next = lines.map((item) => (item.key === key ? { ...item, qty: Math.min(max, qty) } : item));
  writeJson(CART_KEY, next);
  return next;
}

export function removeLine(key: string) {
  const next = readCart().filter((line) => line.key !== key);
  writeJson(CART_KEY, next);
  return next;
}

export function toggleSelect(key: string) {
  const next = readCart().map((line) => (line.key === key ? { ...line, selected: !line.selected } : line));
  writeJson(CART_KEY, next);
  return next;
}

export function selectAll(selected: boolean) {
  const next = readCart().map((line) => ({ ...line, selected }));
  writeJson(CART_KEY, next);
  return next;
}

export function clearCart() {
  writeJson(CART_KEY, []);
  return [];
}

export function clearSelected() {
  const next = readCart().filter((line) => !line.selected);
  writeJson(CART_KEY, next);
  return next;
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function cartTotal(lines: CartLine[], onlySelected = false) {
  return lines.reduce((sum, line) => {
    if (onlySelected && !line.selected) return sum;
    const product = getProductById(line.productId);
    if (!product) return sum;
    return sum + activePrice(product.price, product.salePrice) * line.qty;
  }, 0);
}

export function toggleSaved(productId: string) {
  const saved = readSaved();
  const exists = saved.some((item) => item.productId === productId);
  const next = exists ? saved.filter((item) => item.productId !== productId) : [{ productId, addedAt: Date.now() }, ...saved];
  writeJson(SAVED_KEY, next);
  return next;
}

export function placeOrder(lines: CartLine[], note: string): LocalOrder {
  const orderLines = (lines.some((line) => line.selected) ? lines.filter((line) => line.selected) : lines).map((line) => {
      const product = getProductById(line.productId);
      if (!product) throw new Error("A piece went missing.");
      return {
        productId: line.productId,
        option: line.option,
        qty: line.qty,
        price: activePrice(product.price, product.salePrice),
        name: product.name,
      };
    });
  if (!orderLines.length) throw new Error("Pick something first.");
  const order: LocalOrder = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    lines: orderLines,
    total: orderLines.reduce((sum, line) => sum + line.price * line.qty, 0),
    note,
  };
  writeJson(ORDERS_KEY, [order, ...readOrders()]);
  clearSelected();
  return order;
}
