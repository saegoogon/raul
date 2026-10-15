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
        <h2>This week · top 3</h2>
        {top.length ? (
          <ol>
            {top.map((item, index) => (
              <li key={item.id}>
                <span className="night-rank">{index + 1}</span>
                <Link href={`/s/${item.id}`}>{item.title}</Link>
                <em>Feel {item.starCount}</em>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mute">Nothing this week yet.</p>
        )}
      </section>
      <section>
        <h2>Trends</h2>
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
          <p className="mute">No code posted this week.</p>
        )}
      </section>
    </aside>
  );
}
