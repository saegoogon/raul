import { Suspense } from "react";
import Link from "next/link";
import { GuestHero } from "@/components/GuestHero";
import { PostFeed } from "@/components/PostFeed";
import { getPosts } from "@/lib/posts";

async function HomeFeed({ mode }: { mode: "hot" | "new" }) {
  const posts = await getPosts(mode);
  return <PostFeed posts={posts} />;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const mode = sort === "new" ? "new" : "hot";

  return (
    <div className="flex flex-col gap-5">
      <GuestHero />

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

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl bg-zinc-200" />
            <div className="h-80 animate-pulse rounded-2xl bg-zinc-200" />
          </div>
        }
      >
        <HomeFeed mode={mode} />
      </Suspense>
    </div>
  );
}
