import { Suspense } from "react";
import Link from "next/link";
import { GuestHero } from "@/components/GuestHero";
import { NightRoom } from "@/components/NightRoom";
import { PostFeed } from "@/components/PostFeed";
import { SearchBar } from "@/components/SearchBar";
import { WinkLoader } from "@/components/WinkLoader";
import { getCurrentUser, getTonightPosts, getPosts } from "@/lib/posts";
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
        emptyBody="Moments last 24 hours. Share one before the dark takes it. 하루면 사라져요."
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
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-5">
      <GuestHero isLoggedIn={!!user} />
      <SearchBar value={q} />

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl italic tracking-tight">
          {q
            ? `Search: ${q}`
            : mode === "night"
              ? "Tonight"
              : mode === "new"
                ? "Latest"
                : "Popular"}
        </h2>
        <div className="flex rounded-full border border-line bg-ink p-1 text-sm">
          <Link
            href="/"
            className={`rounded-full px-3 py-1 ${
              mode === "night" && !q
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            Night
          </Link>
          <Link
            href={q ? `/?sort=hot&q=${encodeURIComponent(q)}` : "/?sort=hot"}
            className={`rounded-full px-3 py-1 ${
              mode === "hot"
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            Popular
          </Link>
          <Link
            href={q ? `/?sort=new&q=${encodeURIComponent(q)}` : "/?sort=new"}
            className={`rounded-full px-3 py-1 ${
              mode === "new"
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            Latest
          </Link>
        </div>
      </div>

      <Suspense fallback={<WinkLoader />}>
        {mode === "night" && !q ? (
          <NightHome />
        ) : (
          <HomeFeed mode={mode === "night" ? "new" : mode} query={q} />
        )}
      </Suspense>
    </div>
  );
}
