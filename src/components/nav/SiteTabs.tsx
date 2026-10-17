import Link from "next/link";

export function SiteTabs({
  active,
  communityCount,
}: {
  active: "community" | "tools";
  communityCount?: number;
}) {
  return (
    <nav className="tabs" aria-label="실험실 구역">
      <Link href="/" className={`tab${active === "community" ? " is-on" : ""}`}>
        커뮤니티
        {communityCount != null ? <em>{communityCount}</em> : null}
      </Link>
      <Link href="/tools" className={`tab${active === "tools" ? " is-on" : ""}`}>
        도구
      </Link>
      <span className="tab is-wait">다운로드</span>
    </nav>
  );
}
