import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/CommentSection";
import { ShortsPlayer } from "@/components/ShortsPlayer";
import { VoteButton } from "@/components/VoteButton";
import { isVideoUrl } from "@/lib/media";
import { getComments, getCurrentUser, getPost } from "@/lib/posts";
import { timeAgo } from "@/lib/timeAgo";

export default async function PostPage({
  params,
}: PageProps<"/post/[id]">) {
  const { id } = await params;
  const [post, comments, user] = await Promise.all([
    getPost(id),
    getComments(id),
    getCurrentUser(),
  ]);

  if (!post) notFound();

  const caption = post.content || post.title;

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {post.image_url && isVideoUrl(post.image_url) ? (
        <div className="bg-black">
          <ShortsPlayer
            src={post.image_url}
            className="mx-auto max-h-[80vh] w-full object-contain"
          />
        </div>
      ) : post.image_url ? (
        <div className="relative aspect-square w-full bg-zinc-100 sm:aspect-video">
          <Image
            src={post.image_url}
            alt={caption}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null}

      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {post.profiles?.username ?? "someone"}
          </p>
          <p className="text-xs text-zinc-500">{timeAgo(post.created_at)}</p>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-zinc-800">{caption}</p>
        <div className="mt-3">
          <VoteButton
            postId={post.id}
            voteCount={post.vote_count}
            userVote={post.user_vote}
          />
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 pb-4">
        <CommentSection
          postId={post.id}
          comments={comments}
          isLoggedIn={!!user}
        />
      </div>

      <div className="border-t border-zinc-200 px-4 py-3">
        <Link href="/" className="text-sm font-medium text-zinc-950 hover:underline">
          ← Back to the feed
        </Link>
      </div>
    </article>
  );
}
