import { CommentForm } from "@/components/community/CommentForm";
import { Vote } from "@/components/community/Vote";
import { timeAgo } from "@/lib/community/time";
import type { Comment } from "@/lib/community/types";
import Link from "next/link";

export function CommentTree({ comments, postId, signedIn }: { comments: Comment[]; postId: string; signedIn: boolean }) {
  const roots = comments.filter((item) => !item.parentId);
  const kids = (id: string) => comments.filter((item) => item.parentId === id);
  return (
    <div className="comment-tree">
      {roots.map((item) => (
        <CommentNode key={item.id} comment={item} replies={kids(item.id)} postId={postId} signedIn={signedIn} />
      ))}
    </div>
  );
}

function CommentNode({
  comment,
  replies,
  postId,
  signedIn,
}: {
  comment: Comment;
  replies: Comment[];
  postId: string;
  signedIn: boolean;
}) {
  return (
    <article className="comment">
      <Vote score={comment.score} myVote={comment.myVote} postId={postId} commentId={comment.id} />
      <div>
        <p className="post-meta">
          <Link href={`/u/${comment.author.username}`}>@{comment.author.username}</Link>
          <span>·</span>
          <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt)}</time>
        </p>
        <p className="comment-body">{comment.body}</p>
        {signedIn ? <CommentForm postId={postId} parentId={comment.id} compact /> : null}
        {replies.length ? (
          <div className="comment-kids">
            {replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} replies={[]} postId={postId} signedIn={signedIn} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
