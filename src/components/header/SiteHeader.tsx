"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useSearch } from "@/components/search/SearchProvider";
import { Icon, Logo } from "@/components/Icon";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?tag=new", label: "New" },
  { href: "/shop?tag=best", label: "Best" },
  { href: "/shop?category=night", label: "Collection" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const path = usePathname();
  const { count, ready } = useCart();
  const search = useSearch();
  const [menu, setMenu] = useState(false);
  const store = !path.startsWith("/login") && !path.startsWith("/signup");

  return (
    <header className="site-header">
      <a href="#main" className="skip">
        Skip to shop
      </a>
      <div className="site-header-bar">
        <Link href="/" className="brand" onClick={() => setMenu(false)}>
          <Logo size={18} />
          <span>BLACKSMILE</span>
        </Link>

        {store ? (
          <nav className="site-nav" aria-label="Shop">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="site-tools">
          {store ? (
            <>
              <button type="button" className="icon-btn" aria-label="Search" onClick={search.show}>
                <Icon name="search" size={18} />
              </button>
              <Link href="/account" className="icon-btn" aria-label="Account">
                <Icon name="user" size={18} />
              </Link>
              <Link href="/cart" className="icon-btn cart-link" aria-label={ready ? `Bag, ${count} items` : "Bag"}>
                <Icon name="bag" size={18} />
                {ready && count ? <span className="cart-count">{count}</span> : null}
              </Link>
              <button type="button" className="icon-btn menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
                <Icon name={menu ? "close" : "menu"} size={18} />
              </button>
            </>
          ) : (
            <Link href="/shop" className="nav-link">
              Shop
            </Link>
          )}
        </div>
      </div>

      {menu && store ? (
        <nav className="mobile-nav" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMenu(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
