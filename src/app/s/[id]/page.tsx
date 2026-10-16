import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/snippets/CodeBlock";
import { CommentForm } from "@/components/snippets/CommentForm";
import { CommentTree } from "@/components/snippets/CommentTree";
import { SetupNote } from "@/components/snippets/SetupNote";
import { Star } from "@/components/snippets/Star";
import { getSnippet } from "@/lib/snippets/queries";
import { timeAgo } from "@/lib/snippets/time";
import { getCurrentUser } from "@/lib/user";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { snippet } = await getSnippet(id);
  return { title: snippet?.title ?? "글" };
}

export default async function SnippetPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { snippet, comments, status } = await getSnippet(id);
  if (status === "ok" && !snippet) notFound();

  return (
    <main className="page-pad thread">
      <SetupNote status={status} />
      {snippet ? (
        <>
          <article className="snippet-detail">
            <div className="snippet-head">
              <h1>{snippet.title}</h1>
              <Star snippetId={snippet.id} count={snippet.starCount} starred={snippet.starred} />
            </div>
            <p className="post-meta">
              <Link href={`/u/${snippet.author.username}`}>@{snippet.author.username}</Link>
              <span>{timeAgo(snippet.createdAt)}</span>
              {snippet.code.trim() ? (
                <>
                  <span>·</span>
                  <span>{snippet.language}</span>
                </>
              ) : null}
            </p>
            {snippet.note ? <p className="thread-body">{snippet.note}</p> : null}
            {snippet.code.trim() ? <CodeBlock language={snippet.language} code={snippet.code} /> : null}
          </article>
          {user ? <CommentForm snippetId={snippet.id} /> : <Link href="/login">댓글을 쓰려면 로그인하세요.</Link>}
          <CommentTree comments={comments} snippetId={snippet.id} signedIn={Boolean(user)} />
        </>
      ) : null}
    </main>
  );
}
