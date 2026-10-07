"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { voteComment, votePost } from "@/actions/community";

export function Vote({
  score,
  myVote,
  postId,
  commentId,
}: {
  score: number;
  myVote: number;
  postId: string;
  commentId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [local, setLocal] = useState({ score, myVote });

  const tap = (value: 1 | -1) => {
    const next = local.myVote === value ? 0 : value;
    const delta = next - local.myVote;
    setLocal({ score: local.score + delta, myVote: next });
    start(async () => {
      const result = commentId ? await voteComment(commentId, postId, next) : await votePost(postId, next);
      if (result && "error" in result && result.error) {
        setLocal({ score, myVote });
      }
      router.refresh();
    });
  };

  return (
    <div className="vote">
      <button type="button" className={local.myVote === 1 ? "is-on" : ""} aria-label="Up" disabled={pending} onClick={() => tap(1)}>
        +
      </button>
      <span>{local.score}</span>
      <button type="button" className={local.myVote === -1 ? "is-on down" : "down"} aria-label="Down" disabled={pending} onClick={() => tap(-1)}>
        −
      </button>
    </div>
  );
}
