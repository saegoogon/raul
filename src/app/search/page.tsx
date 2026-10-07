import { PostRow } from "@/components/community/PostRow";
import { listPosts } from "@/lib/community/queries";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const { posts } = q ? await listPosts({ q, sort: "new" }) : { posts: [] };

  return (
    <main className="page-pad">
      <h1 className="page-title">{q ? `“${q}”` : "Search"}</h1>
      <form className="search-form" action="/search">
        <input name="q" defaultValue={q} className="search-input" placeholder="Search posts" />
        <button type="submit" className="btn-ghost">
          Search
        </button>
      </form>
      <div className="feed">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
      {q && !posts.length ? <p className="mute">No matching posts.</p> : null}
    </main>
  );
}
