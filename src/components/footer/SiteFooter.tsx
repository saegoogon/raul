import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-mark">BLACKSMILE</p>
      <nav className="footer-nav">
        <Link href="/">Feed</Link>
        <Link href="/about">About</Link>
        <Link href="/account">Account</Link>
      </nav>
      <p className="footer-note">blacksmile.co.kr · Seoul</p>
    </footer>
  );
}
