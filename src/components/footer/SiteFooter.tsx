import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-mark">BLACKSMILE</p>
      <nav className="footer-nav">
        <Link href="/shop">Shop</Link>
        <Link href="/about">About</Link>
        <Link href="/account">Account</Link>
        <Link href="/cart">Bag</Link>
      </nav>
      <p className="footer-note">Objects for the dark, with a mouth. Seoul.</p>
    </footer>
  );
}
