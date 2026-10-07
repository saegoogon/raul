import { CheckoutView } from "@/app/checkout/CheckoutView";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <main className="page-pad">
      <h1 className="page-title">Checkout</h1>
      <CheckoutView
        mode={String(params.mode ?? "cart")}
        productId={String(params.product ?? "")}
        option={String(params.option ?? "")}
        qty={Number(params.qty ?? 1) || 1}
      />
    </main>
  );
}
