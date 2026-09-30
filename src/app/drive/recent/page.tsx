import { DriveView } from "@/components/drive/DriveView";
import { listRecent, thumbnails } from "@/lib/drive-server";

export const metadata = { title: "Recent" };

export default async function RecentPage() {
  const items = await listRecent();
  return (
    <DriveView
      mode="recent"
      folderId={null}
      title="Recent"
      crumbs={[]}
      items={items}
      thumbs={await thumbnails(items)}
    />
  );
}
