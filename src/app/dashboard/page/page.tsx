import { PageEditor } from "@/components/PageEditor";
import { getProfile, listLinks } from "@/lib/links-server";

export const metadata = { title: "My page" };

export default async function MyPage() {
  const [profile, links] = await Promise.all([getProfile(), listLinks()]);
  return (
    <PageEditor
      profile={profile}
      links={links.filter((link) => link.active && link.on_page).map((link) => link.title)}
    />
  );
}
