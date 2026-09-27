import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/CommentSection";
import { VoteButton } from "@/components/VoteButton";
import { getComments, getCurrentUser, getPost } from "@/lib/posts";

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

  return (
    <article className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex">
        <VoteButton
          postId={post.id}
          voteCount={post.vote_count}
          userVote={post.user_vote}
        />

        <div className="min-w-0 flex-1 py-4 pr-4">
          <p className="text-xs text-zinc-500">
            u/{post.profiles?.username ?? "unknown"}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{post.title}</h1>

          {post.content && (
            <p className="mt-3 whitespace-pre-wrap text-zinc-700">
              {post.content}
            </p>
          )}

          {post.image_url && (
            <div className="relative mt-4 aspect-video max-h-[480px] w-full overflow-hidden rounded-md bg-zinc-100">
              <Image
                src={post.image_url}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
          )}
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
          ← 목록으로
        </Link>
      </div>
    </article>
  );
}
