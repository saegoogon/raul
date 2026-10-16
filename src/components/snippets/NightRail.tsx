import Link from "next/link";
import type { Snippet } from "@/lib/snippets/types";

export function NightRail({
  top,
  trends,
}: {
  top: Snippet[];
  trends: { language: string; count: number }[];
}) {
  return (
    <aside className="night-rail">
      <section>
        <h2>이번 주</h2>
        {top.length ? (
          <ol>
            {top.map((item, index) => (
              <li key={item.id}>
                <span className="night-rank">{String(index + 1).padStart(2, "0")}</span>
                <Link href={`/s/${item.id}`}>{item.title}</Link>
                <em>Feel {item.starCount}</em>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mute">이번 주 글이 아직 없습니다.</p>
        )}
      </section>
      <section>
        <h2>언어</h2>
        {trends.length ? (
          <ul className="trend-list">
            {trends.map((item) => (
              <li key={item.language}>
                <Link href={`/?lang=${item.language}`}>{item.language}</Link>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mute">코드가 올라오면 여기에 모입니다.</p>
        )}
      </section>
    </aside>
  );
}
