import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommentSection } from "@/components/CommentSection";
import { DeletePostButton } from "@/components/DeletePostButton";
import { ShareButton } from "@/components/ShareButton";
import { ShortsPlayer } from "@/components/ShortsPlayer";
import { VoteButton } from "@/components/VoteButton";
import { isVideoUrl } from "@/lib/media";
import { getComments, getPost } from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { timeAgo } from "@/lib/timeAgo";

export async function generateMetadata({
  params,
}: PageProps<"/post/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Moment" };

  const caption = (post.content || post.title || "A moment in the dark").slice(
    0,
    90,
  );
  const who = post.profiles?.username ?? "someone";
  const image =
    post.image_url && !isVideoUrl(post.image_url) ? post.image_url : undefined;

  return {
    title: caption,
    description: `${who} in the dark · ${SITE_NAME}`,
    openGraph: {
      title: caption,
      description: `${who} left a moment in the dark.`,
      type: "article",
      url: `${SITE_URL}/post/${id}`,
      siteName: SITE_NAME,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

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
          <p className="text-xs text-zinc-500">{timeAgo(post.created_at)}</p>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-zinc-800">{caption}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <VoteButton
              postId={post.id}
              voteCount={post.vote_count}
              userVote={post.user_vote}
            />
            <ShareButton
              path={`/post/${post.id}`}
              title="blacksmile"
              text={caption ? `${caption} — a moment in the dark` : "A moment in the dark"}
            />
          </div>
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
