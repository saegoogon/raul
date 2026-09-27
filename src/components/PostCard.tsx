import Image from "next/image";
import Link from "next/link";
import { VoteButton } from "@/components/VoteButton";
import { timeAgo } from "@/lib/timeAgo";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const caption = post.content || post.title;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-zinc-900">
          {post.profiles?.username ?? "someone"}
        </p>
        <p className="text-xs text-zinc-500">{timeAgo(post.created_at)}</p>
      </div>

      <Link href={`/post/${post.id}`} className="block">
        {post.image_url ? (
          <div className="relative aspect-square w-full bg-zinc-100">
            <Image
              src={post.image_url}
              alt={caption}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        ) : (
          <div className="bg-zinc-950 px-5 py-10 text-white">
            <p className="text-lg leading-relaxed">{caption}</p>
          </div>
        )}
      </Link>

      <div className="px-4 py-3">
        <VoteButton
          postId={post.id}
          voteCount={post.vote_count}
          userVote={post.user_vote}
        />
        {post.image_url && caption && caption !== "Today" && (
          <p className="mt-2 text-sm text-zinc-800">
            <span className="font-semibold">
              {post.profiles?.username ?? "someone"}
            </span>{" "}
            {caption}
          </p>
        )}
        <Link
          href={`/post/${post.id}`}
          className="mt-2 inline-block text-xs text-zinc-500 hover:text-zinc-900"
        >
          {post.comment_count
            ? `View ${post.comment_count} comments`
            : "Add a comment"}
        </Link>
      </div>
    </article>
  );
}
