import Link from "next/link";
import { HoodFace } from "@/components/mascot/Hood";
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
    <main className="page-pad">
      <header className="masthead">
        <div className="masthead-brand">
          <p className="kicker">Seoul · 개발자 플랫폼</p>
          <HoodFace size={72} />
          <h1 className="wordmark">BlackSmile</h1>
          <p className="lede">
            이야기하고, 코드를 나누고, 서로의 글에 Feel을 남기는 커뮤니티입니다. 도구와 다운로드는 실제 파일이 준비되면
            엽니다.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link href="/new" className="btn-primary">
                글쓰기
              </Link>
            ) : (
              <Link href="/signup" className="btn-primary">
                가입
              </Link>
            )}
            <Link href="/about" className="btn-ghost">
              소개
            </Link>
          </div>
        </div>
        <ol className="platform-index">
          <li>
            <span className="idx">01</span>
            <Link href="/">커뮤니티</Link>
            <span>최근 활동</span>
          </li>
          <li>
            <span className="idx">02</span>
            <span>도구</span>
            <span className="soon">준비 중</span>
          </li>
          <li>
            <span className="idx">03</span>
            <span>다운로드</span>
            <span className="soon">준비 중</span>
          </li>
        </ol>
      </header>

      <div className="feed-layout">
        <section>
          <div className="board-head">
            <h2>커뮤니티</h2>
            <SortLinks base={sortBase} sort={sort} />
          </div>
          <SetupNote status={status} />
          {snippets.length ? (
            <div className="issue-list">
              {snippets.map((snippet) => (
                <SnippetRow key={snippet.id} snippet={snippet} />
              ))}
            </div>
          ) : status === "ok" ? (
            <p className="mute">아직 글이 없습니다.</p>
          ) : null}
        </section>
        <NightRail top={board.top} trends={board.trends} />
      </div>
    </main>
  );
}
