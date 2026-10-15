import Link from "next/link";
import { NightRail } from "@/components/snippets/NightRail";
import { SetupNote } from "@/components/snippets/SetupNote";
import { SnippetRow } from "@/components/snippets/SnippetRow";
import { SortLinks } from "@/components/snippets/SortLinks";
import { isLanguage } from "@/lib/snippets/languages";
import { listSnippets, weekBoard } from "@/lib/snippets/queries";
import { getCurrentUser } from "@/lib/user";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = params.sort === "new" ? "new" : "hot";
  const language = typeof params.lang === "string" && isLanguage(params.lang) ? params.lang : undefined;
  const user = await getCurrentUser();
  const [{ snippets, status }, board] = await Promise.all([listSnippets({ sort, language }), weekBoard()]);
  const sortBase = language ? `/?lang=${language}` : "/";

  return (
    <main className="page-pad feed-layout">
      <section>
        <header className="feed-hero">
          <p className="kicker">root@blacksmile:~$</p>
          <h1 className="glitch-title" data-text="A dark GitHub.">
            A dark GitHub.<span className="caret" aria-hidden />
          </h1>
          <p className="lede">A night board for people who write code. Talk, paste, feel.</p>
          <div className="hero-actions">
            {user ? (
              <Link href="/new" className="btn-primary">
                New
              </Link>
            ) : (
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            )}
            <Link href="/about" className="btn-ghost">
              About
            </Link>
          </div>
        </header>
        <SetupNote status={status} />
        <SortLinks base={sortBase} sort={sort} />
        {snippets.length ? (
          <div className="issue-list">
            {snippets.map((snippet) => (
              <SnippetRow key={snippet.id} snippet={snippet} />
            ))}
          </div>
        ) : status === "ok" ? (
          <p className="mute">No posts yet.</p>
        ) : null}
      </section>
      <NightRail top={board.top} trends={board.trends} />
    </main>
  );
}
