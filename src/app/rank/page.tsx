import { PlayWink } from "@/components/PlayWink";
import { TonightRank } from "@/components/TonightRank";
import { getTonightRank } from "@/lib/rank";

export const metadata = {
  title: "Tonight ranking",
};

export default async function RankPage() {
  const { board, mine } = await getTonightRank();

  return (
    <div className="flex flex-col gap-5">
      <PlayWink rank={mine?.rank ?? null} score={mine?.score ?? 0} />
      <TonightRank board={board} mine={mine} />
    </div>
  );
}
