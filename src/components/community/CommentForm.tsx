"use client";

import { useActionState } from "react";
import { createComment } from "@/actions/community";

export function CommentForm({ postId, parentId, compact }: { postId: string; parentId?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(createComment, null);
  return (
    <form action={action} className={compact ? "reply-form" : "composer"}>
      <input type="hidden" name="postId" value={postId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <textarea name="body" className="field" rows={compact ? 2 : 4} required placeholder={compact ? "Reply" : "Write a reply"} />
      {state?.error ? <p className="text-sm text-warn">{state.error}</p> : null}
      <button type="submit" className="btn-ghost" disabled={pending}>
        {pending ? "Sending…" : compact ? "Reply" : "Reply"}
      </button>
    </form>
  );
}
