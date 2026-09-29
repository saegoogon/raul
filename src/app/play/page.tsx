import { StoryPlay } from "@/components/story/StoryPlay";
import { getCurrentUser } from "@/lib/user";
import { getStorySave, hasTrueNight } from "@/lib/story/progress";
import { emptySave } from "@/lib/story/types";

export const metadata = {
  title: "One night",
};

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ new: fresh }, save, paid, user] = await Promise.all([
    searchParams,
    getStorySave(),
    hasTrueNight(),
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
