import { LinksManager } from "@/components/LinksManager";
import { clicksByLink, getProfile, listLinks } from "@/lib/links-server";

export const metadata = { title: "Links" };

export default async function LinksPage() {
  const [links, clicks, profile] = await Promise.all([listLinks(), clicksByLink(30), getProfile()]);
  return <LinksManager links={links} clicks={clicks} username={profile.username} />;
}
