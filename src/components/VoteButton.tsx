"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setLike } from "@/actions/votes";

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
  const [liked, setLiked] = useState(userVote === 1);
  const [count, setCount] = useState(voteCount);

  return (
    <button
      type="button"
      onClick={() => {
        const nextLiked = !liked;
        setLiked(nextLiked);
        setCount((value) => value + (nextLiked ? 1 : -1));

        void setLike(postId, nextLiked).then((result) => {
          if (result?.error === "login") {
            setLiked(liked);
            setCount(voteCount);
            router.push("/login");
          }
        });
      }}
      className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm active:scale-95 ${
        liked
          ? "bg-zinc-950 text-amber-300"
          : "text-zinc-500 hover:bg-zinc-950 hover:text-amber-200"
      }`}
      aria-label="Black smile"
    >
      <span aria-hidden>:)</span>
      <span className="font-medium">{count}</span>
    </button>
  );
}
