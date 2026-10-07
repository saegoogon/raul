import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { allProducts } from "@/lib/shop/catalog";

export default function Home() {
  const products = allProducts();
  const fresh = products.filter((item) => item.isNew).slice(0, 4);
  const picks = products.filter((item) => item.isBest).slice(0, 4);

  return (
    <>
      <section className="hero">
        <h1>
          The night
          <br />
          smiles
          <br />
          <em>back.</em>
        </h1>
        <p className="hero-copy">BlackSmile makes objects that look like they know a joke you have not heard yet. Wear, desk, paper, after hours.</p>
        <div className="hero-actions">
          <Link href="/shop" className="btn-primary">
            Shop
          </Link>
          <Link href="/about" className="btn-ghost px-0">
            What is this
          </Link>
        </div>
      </section>

      <section className="rail">
        <div className="rail-head">
          <span>Just in</span>
          <Link href="/shop?tag=new">All new</Link>
        </div>
        <div className="product-rail">
          {fresh.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="rail">
        <div className="rail-head">
          <span>BlackSmile picks</span>
          <Link href="/shop?tag=best">The loud ones</Link>
        </div>
        <div className="product-rail">
          {picks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
