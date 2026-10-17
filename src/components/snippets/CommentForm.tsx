"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createComment } from "@/actions/snippets";
import { HoodMotion } from "@/components/mascot/HoodMotion";

export function CommentForm({ snippetId, parentId, compact }: { snippetId: string; parentId?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(createComment, null);
  const [ok, setOk] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
      setOk(false);
      return;
    }
    if (wasPending.current && !state?.error) {
      setOk(true);
      const timer = window.setTimeout(() => setOk(false), 900);
      wasPending.current = false;
      return () => window.clearTimeout(timer);
    }
    wasPending.current = false;
  }, [pending, state]);

  return (
    <form action={action} className={compact ? "reply-form" : "composer"}>
      <input type="hidden" name="snippetId" value={snippetId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <textarea name="body" className="field" rows={compact ? 2 : 4} required placeholder={compact ? "답글" : "댓글"} />
      {state?.error ? (
        <div className="hood-error-block">
          <HoodMotion kind="error" size={64} />
          <p className="text-sm text-warn">{state.error}</p>
        </div>
      ) : null}
      <div className="hood-action-row">
        {pending ? <HoodMotion kind="loading" size={32} pose="face" /> : null}
        {ok ? <HoodMotion kind="success" size={32} pose="face" /> : null}
        <button type="submit" className="btn-ghost" disabled={pending}>
          {pending ? "올리는 중…" : "댓글"}
        </button>
      </div>
    </form>
  );
}
