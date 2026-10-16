"use client";

import { useActionState } from "react";
import { createComment } from "@/actions/snippets";

export function CommentForm({ snippetId, parentId, compact }: { snippetId: string; parentId?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(createComment, null);
  return (
    <form action={action} className={compact ? "reply-form" : "composer"}>
      <input type="hidden" name="snippetId" value={snippetId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <textarea name="body" className="field" rows={compact ? 2 : 4} required placeholder={compact ? "답글" : "댓글"} />
      {state?.error ? <p className="text-sm text-warn">{state.error}</p> : null}
      <button type="submit" className="btn-ghost" disabled={pending}>
        {pending ? "올리는 중…" : "댓글"}
      </button>
    </form>
  );
}
