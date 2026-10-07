import { PRODUCTS } from "@/data/products";
import { activePrice } from "@/lib/shop/format";
import type { CatalogQuery, Product, ProductCategory } from "@/lib/shop/types";

export const PAGE_SIZE = 9;

export function allProducts() {
  return PRODUCTS;
}

export function getProduct(slug: string) {
  return PRODUCTS.find((item) => item.slug === slug) ?? null;
}

export function getProductById(id: string) {
  return PRODUCTS.find((item) => item.id === id) ?? null;
}

export function relatedProducts(product: Product, limit = 3) {
  return PRODUCTS.filter((item) => item.id !== product.id && item.category === product.category).slice(0, limit);
}

export function isCategory(value: string | undefined): value is ProductCategory {
  return value === "wear" || value === "object" || value === "paper" || value === "night";
}

export function queryProducts(query: CatalogQuery) {
  const q = query.q?.trim().toLowerCase() ?? "";
  let list = [...PRODUCTS];

  if (query.category && query.category !== "all") {
    list = list.filter((item) => item.category === query.category);
  }
  if (query.tag === "new") list = list.filter((item) => item.isNew);
  if (query.tag === "best") list = list.filter((item) => item.isBest);
  if (q) {
    list = list.filter((item) => {
      const hay = `${item.name} ${item.description} ${item.tags.join(" ")} ${item.category}`.toLowerCase();
      return hay.includes(q);
    });
  }

  const sort = query.sort ?? "newest";
  list.sort((a, b) => {
    if (sort === "price-asc") return activePrice(a.price, a.salePrice) - activePrice(b.price, b.salePrice);
    if (sort === "price-desc") return activePrice(b.price, b.salePrice) - activePrice(a.price, a.salePrice);
    if (sort === "popular") return Number(b.isBest) - Number(a.isBest) || b.stock - a.stock;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  const pageSize = query.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, query.page ?? 1);
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return { items: list.slice(start, start + pageSize), total, page, pages };
}

export function searchHints(q: string) {
  const needle = q.trim().toLowerCase();
  if (needle.length < 1) {
    return { products: PRODUCTS.slice(0, 4), categories: [] as ProductCategory[], terms: ["grin", "night", "black", "mug"] };
  }
  const products = queryProducts({ q: needle, pageSize: 6, page: 1 }).items;
  const categories = Array.from(
    new Set(PRODUCTS.filter((item) => item.category.includes(needle) || item.tags.some((tag) => tag.includes(needle))).map((item) => item.category)),
  );
  const terms = Array.from(new Set(PRODUCTS.flatMap((item) => item.tags))).filter((tag) => tag.includes(needle)).slice(0, 6);
  return { products, categories, terms: terms.length ? terms : ["grin", "night"] };
}
