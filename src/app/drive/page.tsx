import { DriveView } from "@/components/drive/DriveView";
import { listFolder, thumbnails } from "@/lib/drive-server";

export default async function MyDrivePage() {
  const items = await listFolder(null);
  return (
    <DriveView
      mode="folder"
      folderId={null}
      title="My Drive"
      crumbs={[]}
      items={items}
      thumbs={await thumbnails(items)}
    />
  );
}
