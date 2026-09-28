import Link from "next/link";
import { FadingMoment } from "@/components/FadingMoment";
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
      <div className="rounded-2xl border border-dashed border-line bg-ink px-6 py-16 text-center">
        <p className="font-display text-2xl italic text-paper">
          {emptyTitle ?? "The dark is quiet right now"}
        </p>
        <p className="mt-2 text-sm text-mute">
          {emptyBody ?? "Moments last 24 hours. Share before the dark takes it."}
        </p>
        <Link
          href={isLoggedIn ? "/submit" : "/signup"}
          className="mt-4 inline-block rounded-full bg-smile px-5 py-2 text-sm font-medium text-night hover:bg-amber-200"
        >
          {isLoggedIn ? "Share your day" : "Join and share"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <FadingMoment key={post.id} createdAt={post.created_at}>
          <PostCard post={post} />
        </FadingMoment>
      ))}
    </div>
  );
}
