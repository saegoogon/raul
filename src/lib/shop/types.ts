export type ProductCategory = "wear" | "object" | "paper" | "night";

export type ProductOption = {
  name: string;
  values: string[];
};

export type ProductMedia = {
  art: string;
  alt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: ProductMedia[];
  category: ProductCategory;
  tags: string[];
  stock: number;
  isNew: boolean;
  isBest: boolean;
  options: ProductOption[];
  createdAt: string;
  details: string;
  shipping: string;
};

export type CatalogQuery = {
  category?: ProductCategory | "all";
  tag?: "new" | "best" | "all";
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  pageSize?: number;
};
