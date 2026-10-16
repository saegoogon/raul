import Link from "next/link";

export function SortLinks({ base, sort }: { base: string; sort: string }) {
  const join = base.includes("?") ? "&" : "?";
  return (
    <div className="sort-links">
      <Link href={base} className={sort !== "new" ? "is-on" : ""}>
        인기
      </Link>
      <Link href={`${base}${join}sort=new`} className={sort === "new" ? "is-on" : ""}>
        최신
      </Link>
    </div>
  );
}
