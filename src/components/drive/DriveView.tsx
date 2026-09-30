"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type DragEvent,
} from "react";
import {
  commitUpload,
  createFolder,
  deleteForever,
  emptyTrash,
  fileUrl,
  moveItems,
  prepareUpload,
  renameItem,
  restoreItems,
  setShare,
  trashItems,
} from "@/actions/drive";
import { Icon, type IconName } from "@/components/drive/Icon";
import { MoveDialog } from "@/components/drive/MoveDialog";
import { Preview } from "@/components/drive/Preview";
import { Dialog } from "@/components/drive/Dialog";
import { DRIVE_BUCKET, formatBytes, kindOf, type Crumb, type DriveItem, type FileKind } from "@/lib/drive";
import { createClient } from "@/lib/supabase/client";

type Mode = "folder" | "recent" | "trash";
type Layout = "grid" | "list";
type Sort = "name" | "updated" | "size";

type Upload = {
  key: string;
  name: string;
  progress: number;
  state: "uploading" | "done" | "error";
  error?: string;
};

type Modal =
  | { type: "folder" }
  | { type: "rename"; item: DriveItem }
  | { type: "move"; ids: string[] }
  | { type: "share"; item: DriveItem }
  | { type: "delete"; ids: string[] }
  | { type: "empty" }
  | null;

const KIND_ICON: Record<FileKind, IconName> = {
  folder: "folder",
  image: "image",
  video: "video",
  audio: "audio",
  pdf: "pdf",
  text: "text",
  archive: "archive",
  file: "file",
};

const LAYOUT_KEY = "blacksmile-drive-layout";
const layoutListeners = new Set<() => void>();

function readLayout(): Layout {
  return window.localStorage.getItem(LAYOUT_KEY) === "list" ? "list" : "grid";
}

function writeLayout(value: Layout) {
  window.localStorage.setItem(LAYOUT_KEY, value);
  layoutListeners.forEach((listener) => listener());
}

function subscribeLayout(listener: () => void) {
  layoutListeners.add(listener);
  return () => layoutListeners.delete(listener);
}

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

function putObject(path: string, file: File, token: string, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${DRIVE_BUCKET}/${path}`);
    xhr.setRequestHeader("authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed."));
    xhr.onerror = () => reject(new Error("Network error."));
    xhr.send(file);
  });
}

export function DriveView({
  mode,
  folderId,
  title,
  crumbs,
  items,
  thumbs,
}: {
  mode: Mode;
  folderId: string | null;
  title: string;
  crumbs: Crumb[];
  items: DriveItem[];
  thumbs: Record<string, string>;
}) {
  const router = useRouter();
  const layout = useSyncExternalStore(subscribeLayout, readLayout, () => "grid" as Layout);
  const [sort, setSort] = useState<Sort>(mode === "folder" ? "name" : "updated");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [preview, setPreview] = useState<DriveItem | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const canUpload = mode === "folder";

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 3200);
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle ? items.filter((item) => item.name.toLowerCase().includes(needle)) : [...items];
    return list.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
      if (sort === "updated") return b.updated_at.localeCompare(a.updated_at);
      if (sort === "size") return b.size - a.size;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [items, query, sort]);

  const selectedIds = useMemo(
    () => [...selected].filter((id) => items.some((item) => item.id === id)),
    [selected, items],
  );

  const run = useCallback(
    (task: () => Promise<{ ok: boolean; error?: string }>, success?: string) => {
      startTransition(async () => {
        const result = await task();
        if (!result.ok) {
          notify(result.error ?? "Something went wrong.");
          return;
        }
        setSelected(new Set());
        setModal(null);
        if (success) notify(success);
        router.refresh();
      });
    },
    [notify, router],
  );

  const upload = useCallback(
    async (files: File[]) => {
      if (!canUpload || !files.length) return;
      const prepared = await prepareUpload(
        folderId,
        files.map((file) => ({ name: file.name, size: file.size })),
      );
      if (!prepared.ok) {
        notify(prepared.error);
        return;
      }
      const {
        data: { session },
      } = await createClient().auth.getSession();
      if (!session) {
        notify("Your session expired. Log in again.");
        return;
      }

      const jobs = prepared.data.map((ticket, index) => ({ ticket, file: files[index] }));
      setUploads((current) => [
        ...current.filter((entry) => entry.state === "uploading"),
        ...jobs.map(({ ticket }) => ({ key: ticket.id, name: ticket.name, progress: 0, state: "uploading" as const })),
      ]);

      const patch = (key: string, next: Partial<Upload>) =>
        setUploads((current) => current.map((entry) => (entry.key === key ? { ...entry, ...next } : entry)));

      let cursor = 0;
      const worker = async () => {
        while (cursor < jobs.length) {
          const { ticket, file } = jobs[cursor++];
          try {
            await putObject(ticket.path, file, session.access_token, (progress) => patch(ticket.id, { progress }));
            const saved = await commitUpload(folderId, {
              id: ticket.id,
              path: ticket.path,
              name: ticket.name,
              size: file.size,
              mime: file.type,
            });
            if (!saved.ok) throw new Error(saved.error);
            patch(ticket.id, { progress: 1, state: "done" });
          } catch (error) {
            patch(ticket.id, {
              state: "error",
              error: error instanceof Error ? error.message : "Upload failed.",
            });
          }
        }
      };
      await Promise.all(Array.from({ length: Math.min(3, jobs.length) }, worker));
      router.refresh();
    },
    [canUpload, folderId, notify, router],
  );

  const download = useCallback(
    async (item: DriveItem) => {
      const result = await fileUrl(item.id, true);
      if (!result.ok) {
        notify(result.error);
        return;
      }
      window.location.assign(result.data);
    },
    [notify],
  );

  const open = useCallback(
    (item: DriveItem) => {
      if (mode === "trash") return;
      if (item.kind === "folder") router.push(`/drive/f/${item.id}`);
      else setPreview(item);
    },
    [mode, router],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      if (event.key === "Escape") {
        setMenu(null);
        setSelected(new Set());
      }
      if (event.key === "Delete" && selectedIds.length && !modal && mode !== "trash") {
        run(() => trashItems(selectedIds), "Moved to trash.");
      }
    };
    const onClick = () => setMenu(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [mode, modal, run, selectedIds]);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onDragEnter = (event: DragEvent) => {
    if (!canUpload || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (!dragDepth.current) setDragging(false);
  };
  const onDrop = (event: DragEvent) => {
    if (!canUpload) return;
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    void upload([...event.dataTransfer.files]);
  };

  const actionsFor = (item: DriveItem): { label: string; icon: IconName; onSelect: () => void; danger?: boolean }[] => {
    if (mode === "trash") {
      return [
        { label: "Restore", icon: "restore", onSelect: () => run(() => restoreItems([item.id]), "Restored.") },
        { label: "Delete forever", icon: "trash", danger: true, onSelect: () => setModal({ type: "delete", ids: [item.id] }) },
      ];
    }
    const list: { label: string; icon: IconName; onSelect: () => void; danger?: boolean }[] = [
      { label: item.kind === "folder" ? "Open" : "Preview", icon: KIND_ICON[kindOf(item)], onSelect: () => open(item) },
    ];
    if (item.kind === "file") list.push({ label: "Download", icon: "download", onSelect: () => void download(item) });
    list.push(
      { label: "Share", icon: "share", onSelect: () => setModal({ type: "share", item }) },
      { label: "Rename", icon: "rename", onSelect: () => setModal({ type: "rename", item }) },
      { label: "Move", icon: "move", onSelect: () => setModal({ type: "move", ids: [item.id] }) },
      { label: "Move to trash", icon: "trash", danger: true, onSelect: () => run(() => trashItems([item.id]), "Moved to trash.") },
    );
    return list;
  };

  const renderMenu = (item: DriveItem) =>
    menu === item.id ? (
      <div
        role="menu"
        className="absolute right-2 top-10 z-30 w-48 rounded-2xl border border-line bg-ink p-1.5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {actionsFor(item).map((action) => (
          <button
            key={action.label}
            type="button"
            role="menuitem"
            onClick={() => {
              setMenu(null);
              action.onSelect();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-night ${
              action.danger ? "text-mute hover:text-paper" : ""
            }`}
          >
            <Icon name={action.icon} size={16} />
            {action.label}
          </button>
        ))}
      </div>
    ) : null;

  const menuButton = (item: DriveItem) => (
    <button
      type="button"
      aria-label={`Actions for ${item.name}`}
      onClick={(event) => {
        event.stopPropagation();
        setMenu((current) => (current === item.id ? null : item.id));
      }}
      className="rounded-full p-1.5 text-mute hover:bg-night hover:text-paper"
    >
      <Icon name="more" size={18} />
    </button>
  );

  const checkbox = (item: DriveItem) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected.has(item.id)}
      aria-label={`Select ${item.name}`}
      onClick={(event) => {
        event.stopPropagation();
        toggle(item.id);
      }}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
        selected.has(item.id) ? "border-paper bg-paper text-night" : "border-line hover:border-mute"
      }`}
    >
      {selected.has(item.id) ? <Icon name="check" size={14} /> : null}
    </button>
  );

  const busyUploads = uploads.some((entry) => entry.state === "uploading");

  return (
    <div
      className="relative flex flex-1 flex-col px-3 pb-24 pt-4 md:px-6"
      onDragEnter={onDragEnter}
      onDragOver={(event) => canUpload && event.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          {crumbs.length ? (
            <nav className="flex min-w-0 items-center gap-1 text-sm text-mute" aria-label="Breadcrumb">
              <Link href="/drive" className="shrink-0 rounded-full px-2 py-1 hover:bg-ink hover:text-paper">
                My Drive
              </Link>
              {crumbs.map((crumb, index) => (
                <span key={crumb.id} className="flex min-w-0 items-center gap-1">
                  <span aria-hidden>/</span>
                  {index === crumbs.length - 1 ? (
                    <span className="truncate px-2 py-1 text-paper">{crumb.name}</span>
                  ) : (
                    <Link href={`/drive/f/${crumb.id}`} className="truncate rounded-full px-2 py-1 hover:bg-ink hover:text-paper">
                      {crumb.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          )}
        </div>

        {canUpload ? (
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal({ type: "folder" })}>
              <Icon name="plus" size={18} />
              New folder
            </button>
            <button type="button" className="btn-primary" onClick={() => fileInput.current?.click()}>
              <Icon name="upload" size={18} />
              Upload
            </button>
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                void upload([...(event.target.files ?? [])]);
                event.target.value = "";
              }}
            />
          </div>
        ) : null}

        {mode === "trash" && items.length ? (
          <button type="button" className="btn-ghost" onClick={() => setModal({ type: "empty" })}>
            <Icon name="trash" size={18} />
            Empty trash
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-ink px-4 text-mute focus-within:ring-1 focus-within:ring-mute">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search in ${title}`}
            className="min-w-0 flex-1 bg-transparent text-sm text-paper outline-none placeholder:text-mute"
          />
        </label>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          className="h-10 rounded-full bg-ink px-3 text-sm outline-none"
          aria-label="Sort by"
        >
          <option value="name">Name</option>
          <option value="updated">Last modified</option>
          <option value="size">Size</option>
        </select>
        <div className="flex h-10 rounded-full bg-ink p-1">
          {(["grid", "list"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} view`}
              aria-pressed={layout === value}
              onClick={() => writeLayout(value)}
              className={`rounded-full px-2.5 ${layout === value ? "bg-paper text-night" : "text-mute hover:text-paper"}`}
            >
              <Icon name={value} size={16} />
            </button>
          ))}
        </div>
      </div>

      {mode === "trash" ? (
        <p className="mt-3 text-xs text-mute">Items in trash stay until you delete them forever.</p>
      ) : null}

      {selectedIds.length ? (
        <div className="sticky top-16 z-10 mt-3 flex items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm text-night shadow-xl">
          <button type="button" aria-label="Clear selection" onClick={() => setSelected(new Set())} className="rounded-full p-1 hover:bg-black/10">
            <Icon name="close" size={16} />
          </button>
          <span className="flex-1 font-medium">{selectedIds.length} selected</span>
          {mode === "trash" ? (
            <>
              <button type="button" className="chip" onClick={() => run(() => restoreItems(selectedIds), "Restored.")}>
                Restore
              </button>
              <button type="button" className="chip" onClick={() => setModal({ type: "delete", ids: selectedIds })}>
                Delete forever
              </button>
            </>
          ) : (
            <>
              <button type="button" className="chip" onClick={() => setModal({ type: "move", ids: selectedIds })}>
                Move
              </button>
              <button type="button" className="chip" onClick={() => run(() => trashItems(selectedIds), "Moved to trash.")}>
                Trash
              </button>
            </>
          )}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-mute">
            <Icon name={mode === "trash" ? "trash" : query ? "search" : "cloud"} size={30} />
          </div>
          <p className="text-lg font-medium">
            {query ? "No matches" : mode === "trash" ? "Trash is empty" : mode === "recent" ? "No recent files" : "Drop files here"}
          </p>
          <p className="max-w-xs text-sm text-mute">
            {query
              ? "Try a different name."
              : canUpload
                ? "Drag files into this window or use the Upload button."
                : mode === "recent"
                  ? "Files you upload will show up here."
                  : "Deleted files and folders land here."}
          </p>
        </div>
      ) : layout === "grid" ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((item) => {
            const kind = kindOf(item);
            return (
              <li key={item.id} className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => open(item)}
                  onKeyDown={(event) => event.key === "Enter" && open(item)}
                  className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-ink text-left transition-colors ${
                    selected.has(item.id) ? "border-paper" : "border-transparent hover:border-line"
                  } ${mode === "trash" ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    {checkbox(item)}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                    {menuButton(item)}
                  </div>
                  <div className="mx-2 mb-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-night text-mute">
                    {thumbs[item.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbs[item.id]} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <Icon name={KIND_ICON[kind]} size={44} filled={kind === "folder"} />
                    )}
                  </div>
                </div>
                {renderMenu(item)}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line">
          <div className="hidden grid-cols-[1fr_9rem_6rem_2.5rem] gap-3 border-b border-line px-4 py-2 text-xs text-mute sm:grid">
            <span className="pl-8">Name</span>
            <span>{mode === "trash" ? "Trashed" : "Modified"}</span>
            <span>Size</span>
            <span />
          </div>
          <ul>
            {visible.map((item) => {
              const kind = kindOf(item);
              return (
                <li key={item.id} className="relative border-b border-line last:border-b-0">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => open(item)}
                    onKeyDown={(event) => event.key === "Enter" && open(item)}
                    className={`grid grid-cols-[1fr_2.5rem] items-center gap-3 px-4 py-2.5 sm:grid-cols-[1fr_9rem_6rem_2.5rem] ${
                      selected.has(item.id) ? "bg-ink" : "hover:bg-ink/60"
                    } ${mode === "trash" ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {checkbox(item)}
                      <Icon name={KIND_ICON[kind]} size={20} filled={kind === "folder"} className="shrink-0 text-mute" />
                      <span className="truncate text-sm">{item.name}</span>
                      {item.share_token ? <Icon name="share" size={14} className="shrink-0 text-mute" /> : null}
                    </span>
                    <span className="hidden text-sm text-mute sm:block">
                      {dateFormat.format(new Date(item.trashed_at ?? item.updated_at))}
                    </span>
                    <span className="hidden text-sm text-mute sm:block">
                      {item.kind === "folder" ? "—" : formatBytes(item.size)}
                    </span>
                    {menuButton(item)}
                  </div>
                  {renderMenu(item)}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {dragging ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6">
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-paper px-12 py-10 text-center">
            <Icon name="upload" size={40} />
            <p className="text-lg font-medium">Drop to upload to {title}</p>
          </div>
        </div>
      ) : null}

      {uploads.length ? (
        <section className="fixed bottom-4 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-ink shadow-2xl">
          <header className="flex items-center justify-between px-4 py-3 text-sm font-medium">
            {busyUploads
              ? `Uploading ${uploads.filter((entry) => entry.state === "uploading").length}…`
              : `${uploads.filter((entry) => entry.state === "done").length} of ${uploads.length} uploaded`}
            {!busyUploads ? (
              <button type="button" aria-label="Close uploads" onClick={() => setUploads([])} className="rounded-full p-1 hover:bg-night">
                <Icon name="close" size={16} />
              </button>
            ) : null}
          </header>
          <ul className="max-h-60 overflow-y-auto">
            {uploads.map((entry) => (
              <li key={entry.key} className="border-t border-line px-4 py-2.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{entry.name}</span>
                  <span className="shrink-0 text-xs text-mute">
                    {entry.state === "error" ? "Failed" : entry.state === "done" ? <Icon name="check" size={16} /> : `${Math.round(entry.progress * 100)}%`}
                  </span>
                </div>
                {entry.state === "error" ? (
                  <p className="mt-1 text-xs text-mute">{entry.error}</p>
                ) : (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-night">
                    <div className="h-full bg-paper transition-[width]" style={{ width: `${entry.progress * 100}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {toast ? (
        <div role="status" className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-paper px-5 py-2.5 text-sm text-night shadow-2xl">
          {toast}
        </div>
      ) : null}

      {modal?.type === "folder" || modal?.type === "rename" ? (
        <NameDialog
          key={modal.type === "rename" ? modal.item.id : "new"}
          title={modal.type === "folder" ? "New folder" : "Rename"}
          initial={modal.type === "rename" ? modal.item.name : "Untitled folder"}
          busy={pending}
          onClose={() => setModal(null)}
          onSubmit={(name) =>
            modal.type === "folder"
              ? run(() => createFolder(folderId, name))
              : run(() => renameItem(modal.item.id, name))
          }
        />
      ) : null}

      {modal?.type === "move" ? (
        <MoveDialog
          ids={modal.ids}
          busy={pending}
          onClose={() => setModal(null)}
          onMove={(target) => run(() => moveItems(modal.ids, target), "Moved.")}
        />
      ) : null}

      {modal?.type === "share" ? (
        <ShareDialog item={modal.item} onClose={() => setModal(null)} onDone={() => router.refresh()} notify={notify} />
      ) : null}

      {modal?.type === "delete" || modal?.type === "empty" ? (
        <Dialog title={modal.type === "empty" ? "Empty trash?" : "Delete forever?"} onClose={() => setModal(null)}>
          <p className="text-sm text-mute">
            {modal.type === "empty"
              ? "Everything in trash will be permanently deleted. This can't be undone."
              : `${modal.ids.length === 1 ? "This item" : `${modal.ids.length} items`} will be permanently deleted. This can't be undone.`}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={pending}
              onClick={() =>
                modal.type === "empty"
                  ? run(() => emptyTrash(), "Trash emptied.")
                  : run(() => deleteForever(modal.ids), "Deleted.")
              }
            >
              Delete forever
            </button>
          </div>
        </Dialog>
      ) : null}

      {preview ? <Preview item={preview} onClose={() => setPreview(null)} onDownload={() => void download(preview)} /> : null}
    </div>
  );
}

function NameDialog({
  title,
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  return (
    <Dialog title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) onSubmit(name);
        }}
      >
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onFocus={(event) => {
            const dot = event.target.value.lastIndexOf(".");
            event.target.setSelectionRange(0, dot > 0 ? dot : event.target.value.length);
          }}
          maxLength={255}
          className="field"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy || !name.trim()}>
            {title === "Rename" ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function ShareDialog({
  item,
  onClose,
  onDone,
  notify,
}: {
  item: DriveItem;
  onClose: () => void;
  onDone: () => void;
  notify: (message: string) => void;
}) {
  const [token, setToken] = useState(item.share_token);
  const [busy, setBusy] = useState(false);
  const link = token ? `${window.location.origin}/s/${token}` : "";

  const change = async (on: boolean) => {
    setBusy(true);
    const result = await setShare(item.id, on);
    setBusy(false);
    if (!result.ok) {
      notify(result.error);
      return;
    }
    setToken(result.data);
    onDone();
  };

  return (
    <Dialog title={`Share “${item.name}”`} onClose={onClose}>
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-night p-4">
        <div>
          <p className="text-sm font-medium">{token ? "Anyone with the link" : "Restricted"}</p>
          <p className="text-xs text-mute">
            {token ? "Anyone who has the link can view and download." : "Only you can open this item."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!!token}
          disabled={busy}
          onClick={() => void change(!token)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${token ? "bg-paper" : "bg-line"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-night transition-transform ${token ? "translate-x-5" : "translate-x-0.5"}`}
          />
        </button>
      </div>
      {token ? (
        <div className="mt-4 flex gap-2">
          <input readOnly value={link} className="field flex-1 text-xs" onFocus={(event) => event.target.select()} />
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              void navigator.clipboard.writeText(link).then(
                () => notify("Link copied."),
                () => notify("Copy failed. Select the link and copy it."),
              );
            }}
          >
            Copy
          </button>
        </div>
      ) : null}
      <div className="mt-6 flex justify-end">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Done
        </button>
      </div>
    </Dialog>
  );
}
