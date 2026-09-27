"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { vote } from "@/actions/votes";

export function VoteButton({
  postId,
  voteCount = 0,
  userVote,
}: {
  postId: string;
  voteCount?: number;
  userVote?: number | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic(
    {
      liked: userVote === 1,
      count: voteCount,
    },
    (_current, next: { liked: boolean; count: number }) => next,
  );

  return (
    <button
      type="button"
      onClick={() => {
        const liked = !state.liked;
        const count = state.count + (liked ? 1 : -1);
        startTransition(async () => {
          setState({ liked, count });
          const result = await vote(postId, 1);
          if (result?.error === "login") router.push("/login");
        });
      }}
      className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm active:scale-95 ${
        state.liked
          ? "text-rose-500"
          : "text-zinc-500 hover:bg-rose-50 hover:text-rose-500"
      }`}
      aria-label="Like"
    >
      <span aria-hidden>{state.liked ? "♥" : "♡"}</span>
      <span className="font-medium">{state.count}</span>
    </button>
  );
}
