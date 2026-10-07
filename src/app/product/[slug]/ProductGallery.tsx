"use client";

import { useState } from "react";
import { ProductArt } from "@/components/product/ProductArt";
import type { Product } from "@/lib/shop/types";

export function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const current = product.images[index] ?? product.images[0];

  return (
    <div className="gallery">
      <div className="gallery-main">
        <ProductArt id={current.art} />
      </div>
      {product.images.length > 1 ? (
        <div className="thumbs">
          {product.images.map((image, i) => (
            <button
              key={image.art}
              type="button"
              className={i === index ? "is-on" : ""}
              aria-label={image.alt}
              onClick={() => setIndex(i)}
            >
              <ProductArt id={image.art} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
