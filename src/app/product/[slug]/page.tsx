import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductBuy } from "@/app/product/[slug]/ProductBuy";
import { ProductGallery } from "@/app/product/[slug]/ProductGallery";
import { ProductCard } from "@/components/product/ProductCard";
import { allProducts, getProduct, relatedProducts } from "@/lib/shop/catalog";

export function generateStaticParams() {
  return allProducts().map((product) => ({ slug: product.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Missing piece" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} · BlackSmile`,
      description: product.description,
    },
    alternates: { canonical: `https://www.blacksmile.co.kr/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = relatedProducts(product);

  return (
    <main className="page-pad">
      <article className="product-detail">
        <ProductGallery product={product} />
        <ProductBuy product={product} />
      </article>
      {related.length ? (
        <section className="rail" style={{ paddingInline: 0, paddingTop: 48 }}>
          <div className="rail-head">
            <span>Same room</span>
          </div>
          <div className="product-rail">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
