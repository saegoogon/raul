import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/community/CommentForm";
import { CommentTree } from "@/components/community/CommentTree";
import { SetupNote } from "@/components/community/SetupNote";
import { Vote } from "@/components/community/Vote";
import { getPost } from "@/lib/community/queries";
import { timeAgo } from "@/lib/community/time";
import { getCurrentUser } from "@/lib/user";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { post } = await getPost(id);
  return { title: post?.title ?? "Thread" };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { post, comments, status } = await getPost(id);
  if (status === "ok" && !post) notFound();

  return (
    <main className="page-pad thread">
      <SetupNote status={status} />
      {post ? (
        <>
          <article className="thread-head">
            <Vote score={post.score} myVote={post.myVote} postId={post.id} />
            <div>
              <p className="post-meta">
                <Link href={`/in/${post.room.slug}`}>in/{post.room.slug}</Link>
                <span>·</span>
                <Link href={`/u/${post.author.username}`}>@{post.author.username}</Link>
                <span>·</span>
                <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
              </p>
              <h1>{post.title}</h1>
              {post.url ? (
                <a href={post.url} className="post-url" rel="noreferrer" target="_blank">
                  {post.url}
                </a>
              ) : null}
              {post.body ? <p className="thread-body">{post.body}</p> : null}
            </div>
          </article>
          {user ? <CommentForm postId={post.id} /> : <Link href="/login">Log in to reply.</Link>}
          <CommentTree comments={comments} postId={post.id} signedIn={Boolean(user)} />
        </>
      ) : null}
    </main>
  );
}
