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
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-zinc-500">
      <form action={vote.bind(null, postId, 1)}>
        <button
          type="submit"
          className={`rounded p-1 hover:bg-amber-50 hover:text-amber-600 ${
            userVote === 1 ? "text-amber-600" : ""
          }`}
          aria-label="추천"
        >
          ▲
        </button>
      </form>
      <span className="text-sm font-semibold text-zinc-800">{voteCount}</span>
      <form action={vote.bind(null, postId, -1)}>
        <button
          type="submit"
          className={`rounded p-1 hover:bg-blue-50 hover:text-blue-600 ${
            userVote === -1 ? "text-blue-600" : ""
          }`}
          aria-label="비추천"
        >
          ▼
        </button>
      </form>
    </div>
  );
}
