"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/data/products";

export function ShopToolbar({
  category,
  tag,
  sort,
  q,
}: {
  category: string;
  tag: string;
  sort: string;
  q: string;
}) {
  const router = useRouter();
  const base = new URLSearchParams();
  if (q) base.set("q", q);

  const href = (next: Record<string, string>) => {
    const params = new URLSearchParams(base);
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all" || (key === "sort" && value === "newest")) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  return (
    <div className="shop-tools">
      <Link href={href({ category: "all", tag, sort })} className={!category || category === "all" ? "is-on" : ""}>
        All
      </Link>
      {CATEGORIES.map((item) => (
        <Link key={item.id} href={href({ category: item.id, tag, sort })} className={category === item.id ? "is-on" : ""}>
          {item.label}
        </Link>
      ))}
      <Link href={href({ category, tag: "new", sort })} className={tag === "new" ? "is-on" : ""}>
        New
      </Link>
      <Link href={href({ category, tag: "best", sort })} className={tag === "best" ? "is-on" : ""}>
        Best
      </Link>
      <select
        aria-label="Sort"
        value={sort || "newest"}
        onChange={(event) => router.push(href({ category, tag, sort: event.target.value }))}
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="popular">Popular</option>
      </select>
    </div>
  );
}
