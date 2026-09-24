import Image from "next/image";
import Link from "next/link";
import { VoteButton } from "@/components/VoteButton";
import type { Post } from "@/lib/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="flex overflow-hidden rounded-lg border border-zinc-200 bg-white hover:border-zinc-300">
      <VoteButton
        postId={post.id}
        voteCount={post.vote_count}
        userVote={post.user_vote}
      />

      <div className="min-w-0 flex-1 py-3 pr-4">
        <p className="mb-1 text-xs text-zinc-500">
          u/{post.profiles?.username ?? "unknown"} · {timeAgo(post.created_at)}
        </p>

        <Link href={`/post/${post.id}`} className="block group">
          <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-orange-600">
            {post.title}
          </h2>
          {post.content && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
              {post.content}
            </p>
          )}
        </Link>

        {post.image_url && (
          <div className="relative mt-3 aspect-video max-h-96 w-full overflow-hidden rounded-md bg-zinc-100">
            <Image
              src={post.image_url}
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
        )}

        <Link
          href={`/post/${post.id}`}
          className="mt-2 inline-block text-xs font-medium text-zinc-500 hover:text-orange-600"
        >
          댓글 보기
        </Link>
      </div>
    </article>
  );
}
