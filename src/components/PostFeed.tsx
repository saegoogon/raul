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
      <div className="rounded-2xl border border-dashed border-line bg-ink px-6 py-16 text-center">
        <p className="text-2xl font-semibold tracking-tight text-paper">
          {emptyTitle ?? "지금 어둠은 조용해요"}
        </p>
        <p className="mt-2 text-sm text-mute">
          {emptyBody ?? "순간은 24시간만 남아요. 사라지기 전에 올려 보세요."}
        </p>
        <Link
          href={isLoggedIn ? "/submit" : "/signup"}
          className="mt-4 inline-block rounded-full bg-smile px-5 py-2 text-sm font-medium text-night hover:bg-amber-200"
        >
          {isLoggedIn ? "오늘 올리기" : "가입하고 올리기"}
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
