import { notFound } from "next/navigation";
import { DriveView } from "@/components/drive/DriveView";
import { crumbsFor, getFolder, listFolder, thumbnails } from "@/lib/drive-server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function FolderPage({ params }: PageProps<"/drive/f/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const folder = await getFolder(id);
  if (!folder) notFound();
  const [crumbs, items] = await Promise.all([crumbsFor(folder), listFolder(id)]);
  return (
    <DriveView
      mode="folder"
      folderId={id}
      title={folder.name}
      crumbs={crumbs}
      items={items}
      thumbs={await thumbnails(items)}
    />
  );
}
