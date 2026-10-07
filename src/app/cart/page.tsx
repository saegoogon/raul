import { CartView } from "@/app/cart/CartView";

export const metadata = { title: "Bag" };

export default function CartPage() {
  return (
    <main className="page-pad">
      <h1 className="page-title">Bag</h1>
      <CartView />
    </main>
  );
}
