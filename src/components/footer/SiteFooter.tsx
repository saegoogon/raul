import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-mark">BlackSmile</p>
      <nav className="footer-nav">
        <Link href="/">커뮤니티</Link>
        <Link href="/tools">도구</Link>
        <Link href="/about">소개</Link>
        <Link href="/account">계정</Link>
      </nav>
      <p className="footer-note">blacksmile.co.kr · 대전</p>
    </footer>
  );
}
