import { getStorySave } from "@/lib/story/progress";
import { TitleScreen } from "@/components/story/TitleScreen";

export default async function HomePage() {
  const save = await getStorySave();
  return <TitleScreen cloudSave={!!save} />;
}
