"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, Logo } from "@/components/Icon";
import { useSearch } from "@/components/search/SearchProvider";

const NAV = [
  { href: "/", label: "커뮤니티" },
  { href: "/tools", label: "도구" },
  { href: "/about", label: "소개" },
];

export function SiteHeader() {
  const path = usePathname();
  const search = useSearch();
  const [menu, setMenu] = useState(false);
  const chrome = !path.startsWith("/login") && !path.startsWith("/signup");

  return (
    <header className="site-header">
      <a href="#main" className="skip">
        본문으로
      </a>
      <div className="site-header-bar">
        <Link href="/" className="brand" onClick={() => setMenu(false)}>
          <Logo size={28} />
          blacksmile
        </Link>

        {chrome ? (
          <nav className="site-nav" aria-label="사이트">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link${(item.href === "/" ? path === "/" : path.startsWith(item.href)) ? " is-on" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="site-tools">
          {chrome ? (
            <>
              <button type="button" className="header-search" onClick={search.show}>
                <Icon name="search" size={14} />
                검색
              </button>
              <button type="button" className="icon-btn search-toggle" aria-label="검색" onClick={search.show}>
                <Icon name="search" size={18} />
              </button>
              <Link href="/new" className="icon-btn" aria-label="새 글">
                <Icon name="plus" size={18} />
              </Link>
              <Link href="/account" className="icon-btn" aria-label="계정">
                <Icon name="user" size={18} />
              </Link>
              <button type="button" className="icon-btn menu-btn" aria-label="메뉴" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
                <Icon name={menu ? "close" : "menu"} size={18} />
              </button>
            </>
          ) : (
            <Link href="/" className="nav-link">
              커뮤니티
            </Link>
          )}
        </div>
      </div>

      {menu && chrome ? (
        <nav className="mobile-nav" aria-label="모바일">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMenu(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/new" onClick={() => setMenu(false)}>
            글쓰기
          </Link>
          <Link href="/account" onClick={() => setMenu(false)}>
            계정
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
