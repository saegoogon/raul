"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
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
    <section className="mt-5">
      <h3 className="mb-4 text-sm text-mute">
        {items.length} {items.length === 1 ? "comment" : "comments"}
      </h3>

      {userId ? (
        <form
          className="mb-5 flex items-start gap-3"
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
          <Avatar size={32} />
          <div className="min-w-0 flex-1">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={2}
              placeholder="Say something"
              required
              className="field text-sm placeholder:text-mute"
            />
            <button
              type="submit"
              disabled={pending}
              className="btn-primary mt-2 px-3 py-1.5 text-sm"
            >
              Reply
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-5 text-sm text-mute">
          <Link href="/login" className="font-medium text-smile underline">
            Log in
          </Link>{" "}
          to comment.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((comment) => (
          <li key={comment.id} className="flex items-start gap-3">
            <Avatar size={32} />
            <div className="min-w-0 flex-1 rounded-2xl bg-night/80 px-3 py-2">
              <p className="text-xs text-mute">
                {comment.profiles?.username ?? "someone"} ·{" "}
                {timeAgo(comment.created_at)}
              </p>
              <p className="mt-1 text-sm text-paper">{comment.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
