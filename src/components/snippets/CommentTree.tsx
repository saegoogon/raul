import Link from "next/link";
import { CommentForm } from "@/components/snippets/CommentForm";
import { timeAgo } from "@/lib/snippets/time";
import type { Comment } from "@/lib/snippets/types";

export function CommentTree({ comments, snippetId, signedIn }: { comments: Comment[]; snippetId: string; signedIn: boolean }) {
  const roots = comments.filter((item) => !item.parentId);
  const kids = (id: string) => comments.filter((item) => item.parentId === id);
  if (!roots.length) return <p className="mute">아직 댓글이 없습니다.</p>;
  return (
    <div className="comment-tree">
      {roots.map((item) => (
        <CommentNode key={item.id} comment={item} replies={kids(item.id)} snippetId={snippetId} signedIn={signedIn} />
      ))}
    </div>
  );
}

function CommentNode({
  comment,
  replies,
  snippetId,
  signedIn,
}: {
  comment: Comment;
  replies: Comment[];
  snippetId: string;
  signedIn: boolean;
}) {
  return (
    <article className="comment comment-plain">
      <div>
        <p className="post-meta">
          <Link href={`/u/${comment.author.username}`}>@{comment.author.username}</Link>
          <span>·</span>
          <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt)}</time>
        </p>
        <p className="comment-body">{comment.body}</p>
        {signedIn ? <CommentForm snippetId={snippetId} parentId={comment.id} compact /> : null}
        {replies.length ? (
          <div className="comment-kids">
            {replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} replies={[]} snippetId={snippetId} signedIn={signedIn} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
