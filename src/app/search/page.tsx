import { SnippetRow } from "@/components/snippets/SnippetRow";
import { listSnippets } from "@/lib/snippets/queries";

export const metadata = { title: "검색" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const { snippets } = q ? await listSnippets({ q, sort: "new" }) : { snippets: [] };

  return (
    <main className="page-pad">
      <h1 className="page-title">{q ? `“${q}”` : "검색"}</h1>
      <form className="search-form" action="/search">
        <input name="q" defaultValue={q} className="search-input" placeholder="검색" />
        <button type="submit" className="btn-ghost">
          찾기
        </button>
      </form>
      <div className="issue-list">
        {snippets.map((snippet) => (
          <SnippetRow key={snippet.id} snippet={snippet} />
        ))}
      </div>
      {q && !snippets.length ? <p className="mute">맞는 글이 없습니다.</p> : null}
    </main>
  );
}
