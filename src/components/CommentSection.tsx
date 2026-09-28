"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/Providers";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/timeAgo";
import type { Comment } from "@/lib/types";

export function CommentSection({
  postId,
  comments,
}: {
  postId: string;
  comments: Comment[];
}) {
  const { userId } = useAuth();
  const [items, setItems] = useState(comments);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <section className="mt-6">
      <h3 className="mb-4 text-sm font-semibold text-mute">
        댓글 {items.length}
      </h3>

      {userId ? (
        <form
          className="mb-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const content = text.trim();
            if (!content || pending) return;

            setPending(true);
            const optimistic: Comment = {
              id: `local-${Date.now()}`,
              post_id: postId,
              user_id: userId,
              content,
              created_at: new Date().toISOString(),
              profiles: { id: userId, username: "you", created_at: "" },
            };
            setItems((current) => [...current, optimistic]);
            setText("");

            await createClient().from("comments").insert({
              post_id: postId,
              user_id: userId,
              content,
            });
            setPending(false);
          }}
        >
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            placeholder="한마디 남겨 주세요"
            required
            className="w-full rounded-lg border border-line bg-night px-3 py-2 text-sm text-paper outline-none placeholder:text-mute focus:border-smile"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-smile px-4 py-1.5 text-sm font-medium text-night hover:bg-amber-200 disabled:opacity-50"
          >
            달기
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-mute">
          <Link href="/login" className="font-medium text-smile underline">
            로그인
          </Link>{" "}
          해야 댓글을 달 수 있어요.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((comment) => (
          <li key={comment.id} className="rounded-lg bg-night px-4 py-3">
            <p className="text-xs text-mute">
              {comment.profiles?.username ?? "someone"} ·{" "}
              {timeAgo(comment.created_at)}
            </p>
            <p className="mt-1 text-sm text-paper">{comment.content}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
