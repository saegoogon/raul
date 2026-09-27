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
    <div className="flex flex-col gap-5">
      {!user && (
        <section className="rounded-3xl bg-zinc-950 px-6 py-10 text-white">
          <p className="text-sm font-medium text-amber-300">blacksmile</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Share any photo.
            <br />
            Share your day.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-zinc-300">
            A worldwide feed of ordinary moments. No perfect shots needed.
            <br />
            아무 사진이나, 오늘의 일상을 올려보세요.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
            >
              Join free
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-600 px-5 py-2 text-sm text-white hover:border-zinc-400"
            >
              Log in
            </Link>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {mode === "new" ? "Latest" : "Today"}
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
            Popular
          </Link>
          <Link
            href="/?sort=new"
            className={`rounded-full px-3 py-1 ${
              mode === "new"
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Latest
          </Link>
        </div>
      </div>

      <PostFeed posts={posts} isLoggedIn={!!user} />
    </div>
  );
}
