import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/types";

export function PostFeed({
  posts,
  isLoggedIn,
  emptyTitle,
  emptyBody,
}: {
  posts: Post[];
  isLoggedIn?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="border border-dashed border-line bg-ink px-4 py-12 text-center">
        <p className="text-paper">
          {emptyTitle ?? "The dark is quiet right now"}
        </p>
        <p className="mt-2 text-sm text-mute">
          {emptyBody ?? "Moments last 24 hours. Share before they vanish."}
        </p>
        <Link
          href={isLoggedIn ? "/submit" : "/signup"}
          className="mt-4 inline-block border border-smile bg-smile px-3 py-1.5 text-sm text-night"
        >
          {isLoggedIn ? "Share tonight" : "Join and share"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index < 2} />
      ))}
    </div>
  );
}
