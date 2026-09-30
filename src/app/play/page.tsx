import { StoryPlay } from "@/components/story/StoryPlay";
import { getCurrentUser } from "@/lib/user";
import { getStorySave, ownsFullGame } from "@/lib/story/progress";
import { emptySave } from "@/lib/story/types";

export const metadata = {
  title: "Chapter 1",
};

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ new: fresh }, save, paid, user] = await Promise.all([
    searchParams,
    getStorySave(),
    ownsFullGame(),
    getCurrentUser(),
  ]);
  const startNew = fresh === "1";

  return (
    <StoryPlay
      initial={startNew ? emptySave() : save}
      paid={paid}
      loggedIn={!!user}
      fresh={startNew}
    />
  );
}
