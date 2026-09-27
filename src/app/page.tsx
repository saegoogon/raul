import Link from "next/link";
import { PostFeed } from "@/components/PostFeed";
import { getCurrentUser, getPosts } from "@/lib/posts";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const mode = sort === "new" ? "new" : "hot";
  const [posts, user] = await Promise.all([getPosts(mode), getCurrentUser()]);

  return (
    <div className="flex flex-col gap-4">
      {!user && (
        <section className="rounded-2xl bg-zinc-950 px-6 py-8 text-white">
          <p className="text-sm font-medium text-amber-300">blacksmile</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            누구나 올리고, 누구나 웃는 곳
          </h1>
          <p className="mt-2 max-w-lg text-sm text-zinc-300">
            글, 이미지, 댓글, 추천. 가입하면 바로 올릴 수 있어요.
          </p>
          <div className="mt-5 flex gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-600 px-5 py-2 text-sm text-white hover:border-zinc-400"
            >
              로그인
            </Link>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {mode === "new" ? "최신 글" : "인기 글"}
        </h2>
        <div className="flex rounded-full border border-zinc-300 bg-white p-1 text-sm">
          <Link
            href="/?sort=hot"
            className={`rounded-full px-3 py-1 ${
              mode === "hot"
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            인기
          </Link>
          <Link
            href="/?sort=new"
            className={`rounded-full px-3 py-1 ${
              mode === "new"
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            최신
          </Link>
        </div>
      </div>

      <PostFeed posts={posts} isLoggedIn={!!user} />
    </div>
  );
}
