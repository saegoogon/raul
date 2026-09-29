import Link from "next/link";
import { Crown } from "@/components/Crown";
import { Mascot } from "@/components/Mascot";
import type { RankEntry } from "@/lib/types";

export function TonightRank({
  board,
  mine,
  compact = false,
}: {
  board: RankEntry[];
  mine: RankEntry | null;
  compact?: boolean;
}) {
  const rows = compact ? board.slice(0, 3) : board.slice(0, 20);
  const mineHidden =
    compact && mine && !rows.some((row) => row.userId === mine.userId)
      ? mine
      : null;

  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <Mascot size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 text-base">
            <Crown className="h-4 w-4" />
            Tonight ranking
          </h2>
          <p className="mt-0.5 text-sm text-mute">
            Smiles ×3, posts ×1, winks ×1. Resets in 24 hours.
          </p>
        </div>
        {compact ? (
          <Link href="/rank" className="btn-primary shrink-0 px-3 py-1.5 text-sm">
            Play
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="px-4 pb-5 text-sm text-mute sm:px-5">
          Nobody is on the board yet. Share a moment or wink to enter.
        </p>
      ) : (
        <ol>
          {rows.map((row) => (
            <RankRow
              key={row.userId}
              row={row}
              mine={mine?.userId === row.userId}
            />
          ))}
          {mineHidden ? (
            <li className="border-t border-line px-4 py-2 text-center text-xs text-mute">
              ···
            </li>
          ) : null}
          {mineHidden ? <RankRow row={mineHidden} mine /> : null}
        </ol>
      )}
    </section>
  );
}

function RankRow({
  row,
  mine = false,
}: {
  row: RankEntry;
  mine?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/u/${row.username}`}
        className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${
          row.rank === 1 ? "bg-paper/5" : ""
        } ${mine ? "border-t border-line" : ""}`}
      >
        <span className="flex w-8 items-center justify-center text-sm text-mute">
          {row.rank === 1 ? <Crown className="h-4 w-4 text-paper" /> : row.rank}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">
          {row.username}
          {mine ? <span className="ml-2 text-xs text-mute">you</span> : null}
        </span>
        <span className="text-sm tabular-nums">{row.score}</span>
      </Link>
    </li>
  );
}
