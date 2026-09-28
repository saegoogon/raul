import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
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
  const username = post.profiles?.username;
  const profileHref = username ? `/u/${username}` : "/";

  return (
    <article className="surface overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={profileHref} className="flex min-w-0 items-center gap-2.5">
          <Avatar size={36} />
          <span className="truncate text-sm font-medium text-paper hover:text-smile">
            {username ?? "someone"}
          </span>
        </Link>
        <div className="ml-auto shrink-0">
          <TimeAgo date={post.created_at} />
        </div>
      </div>

      {post.image_url && isVideoUrl(post.image_url) ? (
        <ShortsPlayer src={post.image_url} />
      ) : (
        <Link href={`/post/${post.id}`} className="block">
          {post.image_url ? (
            <div className="relative aspect-[4/5] w-full bg-night sm:aspect-square">
              <Image
                src={post.image_url}
                alt={caption}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
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
        <div className="flex items-center gap-3">
          <VoteButton
            postId={post.id}
            voteCount={post.vote_count}
            userVote={post.user_vote}
          />
          <Link
            href={`/post/${post.id}`}
            className="text-xs text-mute hover:text-smile"
          >
            {post.comment_count
              ? `${post.comment_count} comments`
              : "Add a comment"}
          </Link>
          <div className="ml-auto">
            <DeletePostButton postId={post.id} authorId={post.user_id} />
          </div>
        </div>
        {post.image_url && caption && caption !== "Today" && (
          <p className="mt-2 text-sm leading-relaxed text-paper">
            <Link
              href={profileHref}
              className="font-semibold text-smile hover:underline"
            >
              {username ?? "someone"}
            </Link>{" "}
            {caption}
          </p>
        )}
      </div>
    </article>
  );
}
