import Image from "next/image";
import Link from "next/link";
import { DeletePostButton } from "@/components/DeletePostButton";
import { ShortsPlayer } from "@/components/ShortsPlayer";
import { VoteButton } from "@/components/VoteButton";
import { TimeAgo } from "@/components/TimeAgo";
import { isVideoUrl } from "@/lib/media";
import type { Post } from "@/lib/types";

export function PostCard({ post }: { post: Post }) {
  const caption = post.content || post.title;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href={post.profiles?.username ? `/u/${post.profiles.username}` : "/"}
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          {post.profiles?.username ?? "someone"}
        </Link>
        <TimeAgo date={post.created_at} />
      </div>

      {post.image_url && isVideoUrl(post.image_url) ? (
        <div className="bg-black">
          <ShortsPlayer
            src={post.image_url}
            className="mx-auto max-h-[34rem] w-full object-contain"
          />
        </div>
      ) : (
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
      )}

      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <VoteButton
            postId={post.id}
            voteCount={post.vote_count}
            userVote={post.user_vote}
          />
          <DeletePostButton postId={post.id} authorId={post.user_id} />
        </div>
        {post.image_url && caption && caption !== "Today" && (
          <p className="mt-2 text-sm text-zinc-800">
            <Link
              href={
                post.profiles?.username ? `/u/${post.profiles.username}` : "/"
              }
              className="font-semibold hover:underline"
            >
              {post.profiles?.username ?? "someone"}
            </Link>{" "}
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
