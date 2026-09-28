import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/CommentSection";
import { DeletePostButton } from "@/components/DeletePostButton";
import { ShortsPlayer } from "@/components/ShortsPlayer";
import { VoteButton } from "@/components/VoteButton";
import { isVideoUrl } from "@/lib/media";
import { TimeAgo } from "@/components/TimeAgo";
import { getComments, getPost } from "@/lib/posts";

export default async function PostPage({
  params,
}: PageProps<"/post/[id]">) {
  const { id } = await params;
  const [post, comments] = await Promise.all([
    getPost(id),
    getComments(id),
  ]);

  if (!post) notFound();

  const caption = post.content || post.title;

  return (
    <article className="overflow-hidden border border-line bg-ink">
      {post.image_url && isVideoUrl(post.image_url) ? (
        <ShortsPlayer src={post.image_url} />
      ) : post.image_url ? (
        <div className="relative aspect-square w-full bg-night sm:aspect-video">
          <Image
            src={post.image_url}
            alt={caption}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
            quality={70}
            priority
          />
        </div>
      ) : null}

      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={
              post.profiles?.username ? `/u/${post.profiles.username}` : "/"
            }
            className="text-sm font-semibold text-paper hover:text-smile"
          >
            {post.profiles?.username ?? "someone"}
          </Link>
          <TimeAgo date={post.created_at} />
        </div>
        <p className="mt-3 whitespace-pre-wrap text-paper">{caption}</p>
        <div className="mt-3 flex items-center justify-between">
          <VoteButton
            postId={post.id}
            voteCount={post.vote_count}
            userVote={post.user_vote}
          />
          <DeletePostButton postId={post.id} authorId={post.user_id} />
        </div>
      </div>

      <div className="border-t border-line px-4 pb-4">
        <CommentSection postId={post.id} comments={comments} />
      </div>

      <div className="border-t border-line px-4 py-3">
        <Link href="/" className="text-sm font-medium text-smile hover:underline">
          ← Back to the feed
        </Link>
      </div>
    </article>
  );
}
