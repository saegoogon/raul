import { createComment } from "@/actions/comments";
import type { Comment } from "@/lib/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function CommentSection({
  postId,
  comments,
  isLoggedIn,
}: {
  postId: string;
  comments: Comment[];
  isLoggedIn: boolean;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700">
        댓글 {comments.length}개
      </h3>

      {isLoggedIn ? (
        <form action={createComment} className="mb-6">
          <input type="hidden" name="postId" value={postId} />
          <textarea
            name="content"
            rows={3}
            placeholder="댓글을 입력하세요..."
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="mt-2 rounded-full bg-orange-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
          >
            댓글 달기
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-zinc-500">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
          >
            <p className="text-xs text-zinc-500">
              u/{comment.profiles?.username ?? "unknown"} ·{" "}
              {timeAgo(comment.created_at)}
            </p>
            <p className="mt-1 text-sm text-zinc-800">{comment.content}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
