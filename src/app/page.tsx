import { Suspense } from "react";
import Link from "next/link";
import { GuestHero } from "@/components/GuestHero";
import { NightRoom } from "@/components/NightRoom";
import { PostFeed } from "@/components/PostFeed";
import { SearchBar } from "@/components/SearchBar";
import { getTonightPosts, getPosts } from "@/lib/posts";
import type { Post } from "@/lib/types";

function peopleFromPosts(posts: Post[]) {
  const seen = new Set<string>();
  return posts.flatMap((post) => {
    const username = post.profiles?.username;
    if (!username || seen.has(username)) return [];
    seen.add(username);
    return [{ id: post.user_id, username, created_at: post.created_at }];
  });
}

async function NightHome() {
  const posts = await getTonightPosts();
  return (
    <>
      <NightRoom people={peopleFromPosts(posts)} />
      <PostFeed
        posts={posts}
        emptyTitle="Tonight is still dark"
        emptyBody="Share a moment and leave the first black smile. 올리면 오늘 밤이 열려요."
      />
    </>
  );
}

async function HomeFeed({
  mode,
  query,
}: {
  mode: "hot" | "new";
  query?: string;
}) {
  const posts = await getPosts(mode, query);
  return <PostFeed posts={posts} />;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort, q } = await searchParams;
  const mode = sort === "new" || sort === "hot" ? sort : "night";

  return (
    <div className="flex flex-col gap-5">
      <GuestHero />
      <SearchBar value={q} />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          {q
            ? `Search: ${q}`
            : mode === "night"
              ? "Tonight"
              : mode === "new"
                ? "Latest"
                : "Popular"}
        </h2>
        <div className="flex rounded-full border border-zinc-300 bg-white p-1 text-sm">
          <Link
            href="/"
            className={`rounded-full px-3 py-1 ${
              mode === "night" && !q
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Night
          </Link>
          <Link
            href={q ? `/?sort=hot&q=${encodeURIComponent(q)}` : "/?sort=hot"}
            className={`rounded-full px-3 py-1 ${
              mode === "hot"
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            Popular
          </Link>
          <Link
            href={q ? `/?sort=new&q=${encodeURIComponent(q)}` : "/?sort=new"}
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

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-80 animate-pulse rounded-2xl bg-zinc-200" />
          </div>
        }
      >
        {mode === "night" && !q ? (
          <NightHome />
        ) : (
          <HomeFeed mode={mode === "night" ? "new" : mode} query={q} />
        )}
      </Suspense>
    </div>
  );
}
