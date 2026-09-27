"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const nextLiked = !liked;
        setLiked(nextLiked);
        setCount((value) => value + (nextLiked ? 1 : -1));

        startTransition(async () => {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            setLiked(liked);
            setCount(voteCount);
            router.push("/login");
            return;
          }

          const { data: existing } = await supabase
            .from("votes")
            .select("id, value")
            .eq("user_id", user.id)
            .eq("post_id", postId)
            .maybeSingle();

          if (nextLiked) {
            if (existing) {
              await supabase.from("votes").update({ value: 1 }).eq("id", existing.id);
            } else {
              await supabase.from("votes").insert({
                user_id: user.id,
                post_id: postId,
                value: 1,
              });
            }
          } else if (existing) {
            await supabase.from("votes").delete().eq("id", existing.id);
          }
        });
      }}
      className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm ${
        liked
          ? "text-rose-500"
          : "text-zinc-500 hover:bg-rose-50 hover:text-rose-500"
      }`}
      aria-label="Like"
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      <span className="font-medium">{count}</span>
    </button>
  );
}
