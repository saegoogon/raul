import { Suspense } from "react";
import Link from "next/link";
import { GuestHero } from "@/components/GuestHero";
import { NightRoom } from "@/components/NightRoom";
import { PostFeed } from "@/components/PostFeed";
import { SearchBar } from "@/components/SearchBar";
import { WinkLoader } from "@/components/WinkLoader";
import { getCurrentUser, getPosts } from "@/lib/posts";
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

async function HomeFeed({
  mode,
  query,
  isLoggedIn,
}: {
  mode: "hot" | "new";
  query?: string;
  isLoggedIn: boolean;
}) {
  const posts = await getPosts(mode, query);
  return <PostFeed posts={posts} isLoggedIn={isLoggedIn} />;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort, q } = await searchParams;
  const mode = sort === "new" || sort === "hot" ? sort : "night";
  const user = await getCurrentUser();
  const needTonight = !!user || (mode === "night" && !q);
  const tonight = needTonight ? await getPosts("new") : [];

  return (
    <div className="flex flex-col gap-5">
      {user ? (
        <NightRoom people={peopleFromPosts(tonight)} />
      ) : (
        <GuestHero />
      )}
      <SearchBar value={q} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base">
          {q
            ? `Search: ${q}`
            : mode === "night"
              ? "Tonight"
              : mode === "new"
                ? "New"
                : "Hot"}
        </h2>
        <div className="flex gap-1 rounded-2xl border border-line bg-ink p-1 text-sm">
          <Link
            href="/"
            className={`rounded-xl px-3 py-1.5 ${
              mode === "night" && !q
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            Night
          </Link>
          <Link
            href={q ? `/?sort=hot&q=${encodeURIComponent(q)}` : "/?sort=hot"}
            className={`rounded-xl px-3 py-1.5 ${
              mode === "hot"
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            Hot
          </Link>
          <Link
            href={q ? `/?sort=new&q=${encodeURIComponent(q)}` : "/?sort=new"}
            className={`rounded-xl px-3 py-1.5 ${
              mode === "new"
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            New
          </Link>
        </div>
      </div>

      <Suspense fallback={<WinkLoader />}>
        {mode === "night" && !q ? (
          <PostFeed
            posts={tonight}
            isLoggedIn={!!user}
            emptyTitle="Tonight is still dark"
            emptyBody="Moments last 24 hours. Share one before it is gone."
          />
        ) : (
          <HomeFeed
            mode={mode === "night" ? "new" : mode}
            query={q}
            isLoggedIn={!!user}
          />
        )}
      </Suspense>
    </div>
  );
}
