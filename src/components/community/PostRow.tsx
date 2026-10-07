import Link from "next/link";
import { Vote } from "@/components/community/Vote";
import { timeAgo } from "@/lib/community/time";
import type { Post } from "@/lib/community/types";

export function PostRow({ post }: { post: Post }) {
  return (
    <article className="post-row">
      <Vote score={post.score} myVote={post.myVote} postId={post.id} />
      <div className="post-main">
        <p className="post-meta">
          <Link href={`/in/${post.room.slug}`}>in/{post.room.slug}</Link>
          <span>·</span>
          <Link href={`/u/${post.author.username}`}>@{post.author.username}</Link>
          <span>·</span>
          <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
        </p>
        <h2>
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </h2>
        {post.url ? (
          <a href={post.url} className="post-url" rel="noreferrer" target="_blank">
            {new URL(post.url).hostname}
          </a>
        ) : null}
        <Link href={`/post/${post.id}`} className="post-replies">
          {post.commentCount} {post.commentCount === 1 ? "reply" : "replies"}
        </Link>
      </div>
    </article>
  );
}
