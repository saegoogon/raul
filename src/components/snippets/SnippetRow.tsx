import Link from "next/link";
import { Star } from "@/components/snippets/Star";
import { timeAgo } from "@/lib/snippets/time";
import type { Snippet } from "@/lib/snippets/types";

export function SnippetRow({ snippet }: { snippet: Snippet }) {
  const hasCode = Boolean(snippet.code.trim());
  return (
    <article className="issue-row">
      <span className="issue-status" aria-hidden="true" />
      <div className="issue-main">
        <h2>
          <Link href={`/s/${snippet.id}`}>{snippet.title}</Link>
        </h2>
        <p className="post-meta">
          <Link href={`/u/${snippet.author.username}`}>@{snippet.author.username}</Link>
          <span>{timeAgo(snippet.createdAt)}</span>
          {hasCode ? (
            <>
              <span>·</span>
              <span>{snippet.language}</span>
            </>
          ) : null}
          <span>·</span>
          <Link href={`/s/${snippet.id}`}>
            댓글 {snippet.commentCount}
          </Link>
        </p>
      </div>
      <Star snippetId={snippet.id} count={snippet.starCount} starred={snippet.starred} />
    </article>
  );
}
