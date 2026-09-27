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
          <Link
            href={
              post.profiles?.username ? `/u/${post.profiles.username}` : "/"
            }
            className="text-sm font-semibold hover:underline"
          >
            {post.profiles?.username ?? "someone"}
          </Link>
          <TimeAgo date={post.created_at} />
        </div>
        <p className="mt-3 whitespace-pre-wrap text-zinc-800">{caption}</p>
        <div className="mt-3 flex items-center justify-between">
          <VoteButton
            postId={post.id}
            voteCount={post.vote_count}
            userVote={post.user_vote}
          />
          <DeletePostButton postId={post.id} authorId={post.user_id} />
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 pb-4">
        <CommentSection postId={post.id} comments={comments} />
      </div>

      <div className="border-t border-zinc-200 px-4 py-3">
        <Link href="/" className="text-sm font-medium text-zinc-950 hover:underline">
          ← Back to the feed
        </Link>
      </div>
    </article>
  );
}
