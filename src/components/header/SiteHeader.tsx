"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GlitchText } from "@/components/GlitchText";
import { Icon, Logo } from "@/components/Icon";
import { useSearch } from "@/components/search/SearchProvider";

const NAV = [
  { href: "/", label: "Feed" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const path = usePathname();
  const search = useSearch();
  const [menu, setMenu] = useState(false);
  const chrome = !path.startsWith("/login") && !path.startsWith("/signup");

  return (
    <header className="site-header">
      <a href="#main" className="skip">
        Skip to feed
      </a>
      <div className="site-header-bar">
        <Link href="/" className="brand" onClick={() => setMenu(false)}>
          <Logo size={18} />
          <GlitchText text="BLACKSMILE" />
          <span className="caret" aria-hidden />
        </Link>

        {chrome ? (
          <nav className="site-nav" aria-label="Site">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="site-tools">
          {chrome ? (
            <>
              <button type="button" className="icon-btn" aria-label="Search" onClick={search.show}>
                <Icon name="search" size={18} />
              </button>
              <Link href="/new" className="icon-btn" aria-label="New post">
                <Icon name="plus" size={18} />
              </Link>
              <Link href="/account" className="icon-btn" aria-label="Account">
                <Icon name="user" size={18} />
              </Link>
              <button type="button" className="icon-btn menu-btn" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
                <Icon name={menu ? "close" : "menu"} size={18} />
              </button>
            </>
          ) : (
            <Link href="/" className="nav-link">
              Feed
            </Link>
          )}
        </div>
      </div>

      {menu && chrome ? (
        <nav className="mobile-nav" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMenu(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/new" onClick={() => setMenu(false)}>
            New
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
