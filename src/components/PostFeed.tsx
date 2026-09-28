import Link from "next/link";
import { Mascot } from "@/components/Mascot";
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
      <div className="surface flex flex-col items-center px-5 py-14 text-center">
        <Mascot size="lg" bob />
        <p className="mt-4 text-lg text-paper">
          {emptyTitle ?? "The dark is quiet right now"}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-mute">
          {emptyBody ?? "Moments last 24 hours. Share before they vanish."}
        </p>
        <Link
          href={isLoggedIn ? "/submit" : "/signup"}
          className="btn-primary mt-5 text-sm"
        >
          {isLoggedIn ? "Share tonight" : "Join and share"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index < 2} />
      ))}
    </div>
  );
}
