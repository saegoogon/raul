import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Crown } from "@/components/Crown";
import { getTonightRank } from "@/lib/rank";
import { getProfile } from "@/lib/user";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [profile, ranking] = await Promise.all([
    getProfile(username),
    getTonightRank(),
  ]);
  if (!profile) notFound();

  const entry = ranking.board.find((row) => row.userId === profile.id);

  return (
    <div className="flex flex-col gap-5">
      <section className="surface flex items-center gap-4 px-5 py-6">
        <Avatar size={72} />
        <div>
          <h1 className="text-xl">{profile.username}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-mute">
            {entry ? (
              <>
                {entry.rank === 1 ? <Crown className="h-4 w-4 text-paper" /> : null}
                #{entry.rank} tonight · {entry.score} pts
              </>
            ) : (
              "In the dark"
            )}
          </p>
          <Link href="/play" className="mt-3 inline-flex btn-primary text-sm">
            Play tonight
          </Link>
        </div>
      </section>
    </div>
  );
}
