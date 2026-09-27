import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/types";

export function PostFeed({
  posts,
  isLoggedIn,
}: {
  posts: Post[];
  isLoggedIn?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium text-zinc-800">
          The world is quiet right now
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Share a photo from your day. Anyone, anywhere.
        </p>
        <Link
          href={isLoggedIn ? "/submit" : "/signup"}
          className="mt-4 inline-block rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {isLoggedIn ? "Share your day" : "Join and share"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
