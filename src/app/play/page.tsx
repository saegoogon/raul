import { StoryPlay } from "@/components/story/StoryPlay";
import { getCurrentUser } from "@/lib/user";
import { getStorySave, hasTrueNight } from "@/lib/story/progress";

export const metadata = {
  title: "One night",
};

export default async function PlayPage() {
  const [save, paid, user] = await Promise.all([
    getStorySave(),
    hasTrueNight(),
    getCurrentUser(),
  ]);

  return <StoryPlay initial={save} paid={paid} loggedIn={!!user} />;
}
