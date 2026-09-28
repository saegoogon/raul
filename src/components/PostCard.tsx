import Image from "next/image";
import Link from "next/link";
import { DeletePostButton } from "@/components/DeletePostButton";
import { ShortsPlayer } from "@/components/ShortsPlayer";
import { VoteButton } from "@/components/VoteButton";
import { TimeAgo } from "@/components/TimeAgo";
import { isVideoUrl } from "@/lib/media";
import type { Post } from "@/lib/types";

export function PostCard({
  post,
  priority = false,
}: {
  post: Post;
  priority?: boolean;
}) {
  const caption = post.content || post.title;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-ink">
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href={post.profiles?.username ? `/u/${post.profiles.username}` : "/"}
          className="text-sm font-medium text-paper hover:text-smile"
        >
          {post.profiles?.username ?? "someone"}
        </Link>
        <TimeAgo date={post.created_at} />
      </div>

      {post.image_url && isVideoUrl(post.image_url) ? (
        <ShortsPlayer src={post.image_url} />
      ) : (
        <Link href={`/post/${post.id}`} className="block">
          {post.image_url ? (
            <div className="relative aspect-square w-full bg-night">
              <Image
                src={post.image_url}
                alt={caption}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
                quality={70}
                priority={priority}
              />
            </div>
          ) : (
            <div className="bg-night px-5 py-10 text-paper">
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
          <p className="mt-2 text-sm text-paper">
            <Link
              href={
                post.profiles?.username ? `/u/${post.profiles.username}` : "/"
              }
              className="font-semibold text-smile hover:underline"
            >
              {post.profiles?.username ?? "someone"}
            </Link>{" "}
            {caption}
          </p>
        )}
        <Link
          href={`/post/${post.id}`}
          className="mt-2 inline-block text-xs text-mute hover:text-smile"
        >
          {post.comment_count
            ? `View ${post.comment_count} comments`
            : "Add a comment"}
        </Link>
      </div>
    </article>
  );
}
