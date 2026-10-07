import Link from "next/link";

export function SortLinks({ base, sort }: { base: string; sort: string }) {
  const join = base.includes("?") ? "&" : "?";
  return (
    <div className="sort-links">
      <Link href={base} className={sort !== "new" ? "is-on" : ""}>
        Hot
      </Link>
      <Link href={`${base}${join}sort=new`} className={sort === "new" ? "is-on" : ""}>
        New
      </Link>
    </div>
  );
}
