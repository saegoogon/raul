import { PostCard } from "@/components/PostCard";
import type { Post } from "@/lib/types";

export function PostFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium text-zinc-700">
          아직 게시글이 없어요
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          첫 번째 글을 올려보세요!
        </p>
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
