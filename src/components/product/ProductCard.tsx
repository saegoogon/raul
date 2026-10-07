import Link from "next/link";
import { Price } from "@/components/product/Price";
import { ProductArt } from "@/components/product/ProductArt";
import type { Product } from "@/lib/shop/types";

export function ProductCard({ product }: { product: Product }) {
  const hover = product.images[1] ?? product.images[0];
  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-card-art">
        <ProductArt id={product.images[0].art} className="art-a" />
        <ProductArt id={hover.art} className="art-b" />
        {product.stock <= 0 ? <span className="product-flag">Gone</span> : null}
        {product.stock > 0 && product.isNew ? <span className="product-flag">New</span> : null}
      </div>
      <div className="product-card-meta">
        <span className="product-card-name">{product.name}</span>
        <Price price={product.price} salePrice={product.salePrice} />
      </div>
    </Link>
  );
}
