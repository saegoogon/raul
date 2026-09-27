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
  const liked = userVote === 1;

  return (
    <form action={vote.bind(null, postId, 1)}>
      <button
        type="submit"
        className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm ${
          liked
            ? "text-rose-500"
            : "text-zinc-500 hover:bg-rose-50 hover:text-rose-500"
        }`}
        aria-label="Like"
      >
        <span aria-hidden>{liked ? "♥" : "♡"}</span>
        <span className="font-medium">{voteCount}</span>
      </button>
    </form>
  );
}
