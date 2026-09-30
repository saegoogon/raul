import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/drive/Icon";
import { MediaView } from "@/components/drive/Preview";
import { BrandMark } from "@/components/BrandMark";
import { DRIVE_BUCKET, ITEM_COLUMNS, formatBytes, kindOf, type DriveItem } from "@/lib/drive";
import { sharedItem } from "@/lib/share";

export const metadata: Metadata = {
  title: "Shared with you",
  robots: { index: false, follow: false },
};

export default async function SharedPage({ params, searchParams }: PageProps<"/s/[token]">) {
  const { token } = await params;
  const { f } = await searchParams;
  const shared = await sharedItem(token, typeof f === "string" ? f : undefined);
  if (!shared) notFound();
  const { admin, root, target, crumbs } = shared;
  const base = `/s/${token}`;
  const downloadHref = (id: string) => `${base}/download?id=${id}`;

  let body: React.ReactNode;
  if (target.kind === "file") {
    const kind = kindOf(target);
    const { data } = await admin.storage.from(DRIVE_BUCKET).createSignedUrl(target.storage_path!, 60 * 60);
    const viewable = data?.signedUrl && ["image", "video", "audio", "pdf", "text"].includes(kind);
    body = (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold">{target.name}</h1>
            <p className="text-sm text-mute">{formatBytes(target.size)}</p>
          </div>
          <a href={downloadHref(target.id)} className="btn-primary">
            <Icon name="download" size={18} />
            Download
          </a>
        </div>
        <div className="flex min-h-[60vh] flex-1 items-center justify-center rounded-3xl bg-ink p-4">
          {viewable ? (
            <MediaView kind={kind} url={data.signedUrl} name={target.name} />
          ) : (
            <div className="flex flex-col items-center gap-3 text-mute">
              <Icon name={kind === "archive" ? "archive" : "file"} size={56} />
              <p className="text-sm">No preview for this file type.</p>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    const { data } = await admin
      .from("drive_items")
      .select(ITEM_COLUMNS)
      .eq("parent_id", target.id)
      .is("trashed_at", null)
      .order("kind", { ascending: false })
      .order("name", { ascending: true });
    const items = (data ?? []) as DriveItem[];
    body = (
      <div className="flex flex-col gap-4">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-mute" aria-label="Breadcrumb">
          <Link href={base} className="rounded-full px-2 py-1 hover:bg-ink hover:text-paper">
            {root.name}
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-1">
              <span aria-hidden>/</span>
              <Link href={`${base}?f=${crumb.id}`} className="rounded-full px-2 py-1 hover:bg-ink hover:text-paper">
                {crumb.name}
              </Link>
            </span>
          ))}
        </nav>
        {items.length ? (
          <ul className="overflow-hidden rounded-2xl border border-line">
            {items.map((item) => {
              const kind = kindOf(item);
              return (
                <li key={item.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
                  <Icon name={kind} size={20} filled={kind === "folder"} className="shrink-0 text-mute" />
                  <Link href={`${base}?f=${item.id}`} className="min-w-0 flex-1 truncate text-sm hover:underline">
                    {item.name}
                  </Link>
                  {item.kind === "file" ? (
                    <>
                      <span className="hidden text-xs text-mute sm:block">{formatBytes(item.size)}</span>
                      <a
                        href={downloadHref(item.id)}
                        aria-label={`Download ${item.name}`}
                        className="rounded-full p-1.5 text-mute hover:bg-ink hover:text-paper"
                      >
                        <Icon name="download" size={18} />
                      </a>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl bg-ink px-4 py-10 text-center text-sm text-mute">This folder is empty.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-5">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icon name="cloud" size={22} filled />
          <BrandMark /> <span className="text-mute">Cloud</span>
        </Link>
        <span className="text-xs text-mute">Shared with you</span>
      </header>
      {body}
    </div>
  );
}
