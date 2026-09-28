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
        emptyTitle="오늘 밤은 아직 어두워요"
        emptyBody="순간은 24시간만 남아요. 사라지기 전에 하나 올려 보세요."
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

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          {q
            ? `검색: ${q}`
            : mode === "night"
              ? "오늘 밤"
              : mode === "new"
                ? "최신"
                : "인기"}
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
            오늘 밤
          </Link>
          <Link
            href={q ? `/?sort=hot&q=${encodeURIComponent(q)}` : "/?sort=hot"}
            className={`rounded-full px-3 py-1 ${
              mode === "hot"
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            인기
          </Link>
          <Link
            href={q ? `/?sort=new&q=${encodeURIComponent(q)}` : "/?sort=new"}
            className={`rounded-full px-3 py-1 ${
              mode === "new"
                ? "bg-smile text-night"
                : "text-mute hover:text-paper"
            }`}
          >
            최신
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
