import Link from "next/link";
import { HoodEmpty, HoodMotion } from "@/components/mascot/HoodMotion";
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
      <header className="repo-head">
        <div className="repo-title">
          <HoodMotion kind="enter" size={28} pose="face" />
          <h1>blacksmile</h1>
          <span className="repo-badge">음지</span>
        </div>
        <p className="lede">
          개발자가 글을 올리고 코드를 붙이는 실험실입니다. 커뮤니티는 열려 있습니다. 도구와 다운로드는 실제 파일이
          준비되면 같은 목록에서 엽니다.
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
      </header>

      <nav className="tabs" aria-label="실험실 구역">
        <a className="tab is-on" href="#community">
          커뮤니티
          {status === "ok" ? <em>{snippets.length}</em> : null}
        </a>
        <span className="tab is-wait">도구</span>
        <span className="tab is-wait">다운로드</span>
      </nav>

      <div className="feed-layout">
        <section id="community" tabIndex={-1}>
          <div className="board-head">
            <h2>최근 활동</h2>
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
            <HoodEmpty
              title="아직 글이 없습니다"
              action={
                user ? (
                  <Link href="/new" className="btn-primary">
                    글쓰기
                  </Link>
                ) : (
                  <Link href="/signup" className="btn-primary">
                    가입
                  </Link>
                )
              }
            >
              생각을 먼저 올리거나, 코드를 붙여 보세요.
            </HoodEmpty>
          ) : null}
        </section>
        <NightRail top={board.top} trends={board.trends} />
      </div>
    </main>
  );
}
