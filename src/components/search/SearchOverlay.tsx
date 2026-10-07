"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductArt } from "@/components/product/ProductArt";
import { useSearch } from "@/components/search/SearchProvider";
import { CATEGORIES } from "@/data/products";
import { searchHints } from "@/lib/shop/catalog";
import { formatPrice, activePrice } from "@/lib/shop/format";

export function SearchOverlay() {
  const { open, hide } = useSearch();
  const router = useRouter();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const result = useMemo(() => searchHints(q), [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      window.setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal aria-label="Search">
      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          hide();
          router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
        }}
      >
        <input
          ref={input}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Type a grin, a mug, the night…"
          className="search-input"
          aria-label="Search BlackSmile"
        />
        <button type="button" className="btn-ghost" onClick={hide}>
          Close
        </button>
      </form>

      <div className="search-body">
        <section>
          <h2>Pieces</h2>
          {result.products.length ? (
            <ul className="search-list">
              {result.products.map((product) => (
                <li key={product.id}>
                  <Link href={`/product/${product.slug}`} onClick={hide} className="search-hit">
                    <span className="search-thumb">
                      <ProductArt id={product.images[0].art} />
                    </span>
                    <span>
                      <strong>{product.name}</strong>
                      <em>{formatPrice(activePrice(product.price, product.salePrice))}</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mute">Nothing matches. Try “black” or “grin”.</p>
          )}
        </section>
        <section>
          <h2>Rooms</h2>
          <div className="search-chips">
            {(result.categories.length ? result.categories : CATEGORIES.map((item) => item.id)).map((id) => (
              <Link key={id} href={`/shop?category=${id}`} onClick={hide} className="chip">
                {CATEGORIES.find((item) => item.id === id)?.label ?? id}
              </Link>
            ))}
          </div>
          <h2>Try</h2>
          <div className="search-chips">
            {result.terms.map((term) => (
              <button
                key={term}
                type="button"
                className="chip"
                onClick={() => {
                  setQ(term);
                  input.current?.focus();
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
