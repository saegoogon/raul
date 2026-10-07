import Link from "next/link";
import { ShopToolbar } from "@/app/shop/ShopToolbar";
import { ProductCard } from "@/components/product/ProductCard";
import { isCategory, queryProducts } from "@/lib/shop/catalog";
import type { CatalogQuery } from "@/lib/shop/types";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const categoryRaw = String(params.category ?? "all");
  const tagRaw = String(params.tag ?? "all");
  const sortRaw = String(params.sort ?? "newest");
  const q = String(params.q ?? "");
  const page = Number(params.page ?? 1) || 1;

  const query: CatalogQuery = {
    category: isCategory(categoryRaw) ? categoryRaw : "all",
    tag: tagRaw === "new" || tagRaw === "best" ? tagRaw : "all",
    sort: sortRaw === "price-asc" || sortRaw === "price-desc" || sortRaw === "popular" ? sortRaw : "newest",
    q,
    page,
  };

  const { items, total, pages } = queryProducts(query);

  const pageHref = (next: number) => {
    const search = new URLSearchParams();
    if (isCategory(categoryRaw)) search.set("category", categoryRaw);
    if (tagRaw === "new" || tagRaw === "best") search.set("tag", tagRaw);
    if (query.sort && query.sort !== "newest") search.set("sort", query.sort);
    if (q) search.set("q", q);
    if (next > 1) search.set("page", String(next));
    const qs = search.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <main className="page-pad">
      <h1 className="page-title">{q ? `“${q}”` : "Shop"}</h1>
      <ShopToolbar category={isCategory(categoryRaw) ? categoryRaw : "all"} tag={tagRaw} sort={query.sort ?? "newest"} q={q} />
      {items.length ? (
        <div className="product-rail">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mute">No pieces in this corner. Try another room.</p>
      )}
      {pages > 1 ? (
        <div className="pager">
          {page > 1 ? <Link href={pageHref(page - 1)}>Prev</Link> : <span />}
          <span>
            {page} / {pages} · {total} pieces
          </span>
          {page < pages ? <Link href={pageHref(page + 1)}>Next</Link> : <span />}
        </div>
      ) : null}
    </main>
  );
}
