import { DriveView } from "@/components/drive/DriveView";
import { listTrash } from "@/lib/drive-server";

export const metadata = { title: "Trash" };

export default async function TrashPage() {
  const items = await listTrash();
  return (
    <DriveView mode="trash" folderId={null} title="Trash" crumbs={[]} items={items} thumbs={{}} />
  );
}
