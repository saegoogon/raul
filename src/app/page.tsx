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

async function NightHome({ isLoggedIn }: { isLoggedIn: boolean }) {
  const posts = await getPosts("new");
  return (
    <>
      <NightRoom people={peopleFromPosts(posts)} />
      <PostFeed
        posts={posts}
        isLoggedIn={isLoggedIn}
        emptyTitle="Tonight is still dark"
        emptyBody="Moments last 24 hours. Share one before it is gone."
      />
    </>
  );
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

  return (
    <div className="flex flex-col gap-5">
      <GuestHero isLoggedIn={!!user} />
      <SearchBar value={q} />

      <div className="flex items-end justify-between gap-3 border-b border-line">
        <h2 className="pb-2 text-base">
          {q
            ? `Search: ${q}`
            : mode === "night"
              ? "Tonight"
              : mode === "new"
                ? "New"
                : "Hot"}
        </h2>
        <div className="flex gap-3 text-sm">
          <Link
            href="/"
            className={`pb-2 ${
              mode === "night" && !q
                ? "border-b-2 border-smile text-smile"
                : "text-mute hover:text-paper"
            }`}
          >
            Night
          </Link>
          <Link
            href={q ? `/?sort=hot&q=${encodeURIComponent(q)}` : "/?sort=hot"}
            className={`pb-2 ${
              mode === "hot"
                ? "border-b-2 border-smile text-smile"
                : "text-mute hover:text-paper"
            }`}
          >
            Hot
          </Link>
          <Link
            href={q ? `/?sort=new&q=${encodeURIComponent(q)}` : "/?sort=new"}
            className={`pb-2 ${
              mode === "new"
                ? "border-b-2 border-smile text-smile"
                : "text-mute hover:text-paper"
            }`}
          >
            New
          </Link>
        </div>
      </div>

      <Suspense fallback={<WinkLoader />}>
        {mode === "night" && !q ? (
          <NightHome isLoggedIn={!!user} />
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
