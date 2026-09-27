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
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium text-zinc-700">
          아직 게시글이 없어요
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          첫 번째 글을 올리면 여기 보여요.
        </p>
        <Link
          href={isLoggedIn ? "/submit" : "/signup"}
          className="mt-4 inline-block rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {isLoggedIn ? "글쓰기" : "가입하고 글쓰기"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
