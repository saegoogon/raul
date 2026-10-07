import { formatPrice } from "@/lib/shop/format";

export function Price({ price, salePrice }: { price: number; salePrice: number | null }) {
  if (salePrice != null) {
    return (
      <span className="price">
        <s className="price-was">{formatPrice(price)}</s>
        <em>{formatPrice(salePrice)}</em>
      </span>
    );
  }
  return <span className="price">{formatPrice(price)}</span>;
}
