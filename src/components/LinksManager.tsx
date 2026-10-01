"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { createLink, deleteLink, reorderLinks, setLinkFlag, updateLink, type Result } from "@/actions/links";
import { Dialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { Switch } from "@/components/Switch";
import { SHORT_PREFIX, hostOf, shortUrl, type LinkRow } from "@/lib/links";

type Modal = { type: "edit"; link: LinkRow } | { type: "delete"; link: LinkRow } | null;

export function LinksManager({
  links,
  clicks,
  username,
}: {
  links: LinkRow[];
  clicks: Record<string, number>;
  username: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((current) => (current === message ? null : current)), 2800);
  }, []);

  const run = useCallback(
    (task: () => Promise<Result>, success?: string) =>
      new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await task();
          if (!result.ok) {
            notify(result.error);
            resolve(false);
            return;
          }
          if (success) notify(success);
          setModal(null);
          router.refresh();
          resolve(true);
        });
      }),
    [notify, router],
  );

  const ordered = useMemo(() => {
    if (!order) return links;
    const byId = new Map(links.map((link) => [link.id, link]));
    const sorted = order.map((id) => byId.get(id)).filter((link): link is LinkRow => !!link);
    return [...sorted, ...links.filter((link) => !order.includes(link.id))];
  }, [links, order]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ordered;
    return ordered.filter((link) =>
      [link.title, link.url, link.slug].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [ordered, query]);

  const move = (id: string, step: -1 | 1) => {
    const ids = ordered.map((link) => link.id);
    const from = ids.indexOf(id);
    const to = from + step;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    setOrder(ids);
    void run(() => reorderLinks(ids)).then(() => setOrder(null));
  };

  const copy = (slug: string) => {
    void navigator.clipboard.writeText(`${window.location.origin}${SHORT_PREFIX}${slug}`).then(
      () => notify("Short link copied."),
      () => notify("Copy failed."),
    );
  };

  const total = Object.values(clicks).reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
          <p className="mt-1 text-sm text-mute">
            {links.length} {links.length === 1 ? "link" : "links"} · {total.toLocaleString("en")} clicks in the last 30 days
          </p>
        </div>
        {username ? (
          <Link href="/dashboard/page" className="btn-ghost">
            <Icon name="user" size={16} />
            Edit my page
          </Link>
        ) : null}
      </div>

      <CreateLink onCreate={(input) => run(() => createLink(input), "Link created.")} busy={pending} />

      {links.length ? (
        <label className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-mute focus-within:ring-1 focus-within:ring-mute">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search links"
            className="min-w-0 flex-1 bg-transparent text-sm text-paper outline-none placeholder:text-mute"
          />
        </label>
      ) : null}

      {links.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-night">
            <Icon name="link" size={26} />
          </div>
          <p className="text-lg font-medium">Create your first link</p>
          <p className="max-w-sm text-sm text-mute">
            Paste any web address above. You get a short link to share, and it shows up on your public page.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-mute">No links match “{query}”.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((link, index) => (
            <li
              key={link.id}
              className={`surface flex flex-col gap-3 p-4 transition-opacity sm:flex-row sm:items-center ${
                link.active ? "" : "opacity-60"
              }`}
            >
              {!query ? (
                <div className="hidden flex-col sm:flex">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0 || pending}
                    onClick={() => move(link.id, -1)}
                    className="rounded-md p-0.5 text-mute hover:text-paper disabled:opacity-30"
                  >
                    <Icon name="up" size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === visible.length - 1 || pending}
                    onClick={() => move(link.id, 1)}
                    className="rounded-md p-0.5 text-mute hover:text-paper disabled:opacity-30"
                  >
                    <Icon name="down" size={16} />
                  </button>
                </div>
              ) : null}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{link.title}</p>
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <button
                    type="button"
                    onClick={() => copy(link.slug)}
                    className="flex items-center gap-1.5 truncate text-paper hover:underline"
                    title="Copy short link"
                  >
                    {shortUrl(link.slug)}
                    <Icon name="copy" size={14} className="shrink-0 text-mute" />
                  </button>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="truncate text-mute hover:text-paper">
                    → {hostOf(link.url)}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href={`/dashboard/analytics?link=${link.id}`}
                  className="flex items-center gap-1.5 rounded-full bg-night px-3 py-1.5 text-sm hover:bg-line"
                  title="Clicks in the last 30 days"
                >
                  <Icon name="chart" size={14} className="text-mute" />
                  {(clicks[link.id] ?? 0).toLocaleString("en")}
                </Link>
                <label className="flex items-center gap-2 text-xs text-mute" title="Show on my page">
                  <Icon name="eye" size={16} />
                  <Switch
                    checked={link.on_page}
                    disabled={pending}
                    label="Show on my page"
                    onChange={(value) => void run(() => setLinkFlag(link.id, "on_page", value))}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-mute" title="Link is live">
                  Live
                  <Switch
                    checked={link.active}
                    disabled={pending}
                    label="Link is live"
                    onChange={(value) =>
                      void run(() => setLinkFlag(link.id, "active", value), value ? "Link is live." : "Link paused.")
                    }
                  />
                </label>
                <button
                  type="button"
                  aria-label={`Edit ${link.title}`}
                  onClick={() => setModal({ type: "edit", link })}
                  className="rounded-full p-1.5 text-mute hover:bg-night hover:text-paper"
                >
                  <Icon name="edit" size={18} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${link.title}`}
                  onClick={() => setModal({ type: "delete", link })}
                  className="rounded-full p-1.5 text-mute hover:bg-night hover:text-paper"
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal?.type === "edit" ? (
        <EditLink
          key={modal.link.id}
          link={modal.link}
          busy={pending}
          onClose={() => setModal(null)}
          onSave={(input) => void run(() => updateLink(modal.link.id, input), "Saved.")}
        />
      ) : null}

      {modal?.type === "delete" ? (
        <Dialog title="Delete link?" onClose={() => setModal(null)}>
          <p className="text-sm text-mute">
            {shortUrl(modal.link.slug)} will stop working and its click history will be removed. This can&apos;t be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={pending}
              onClick={() => void run(() => deleteLink(modal.link.id), "Link deleted.")}
            >
              Delete
            </button>
          </div>
        </Dialog>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-paper px-5 py-2.5 text-sm text-night shadow-2xl"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function CreateLink({
  onCreate,
  busy,
}: {
  onCreate: (input: { url: string; title: string; slug: string; onPage: boolean }) => Promise<boolean>;
  busy: boolean;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [onPage, setOnPage] = useState(true);
  const [more, setMore] = useState(false);

  return (
    <form
      className="surface flex flex-col gap-3 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!url.trim()) return;
        if (await onCreate({ url, title, slug, onPage })) {
          setUrl("");
          setTitle("");
          setSlug("");
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste a long URL, e.g. https://example.com/my-page"
          inputMode="url"
          autoComplete="off"
          className="field flex-1"
          aria-label="Destination URL"
        />
        <button type="submit" className="btn-primary py-2.5" disabled={busy || !url.trim()}>
          <Icon name="plus" size={18} />
          Shorten
        </button>
      </div>
      <button
        type="button"
        onClick={() => setMore((value) => !value)}
        className="self-start text-xs text-mute hover:text-paper"
        aria-expanded={more}
      >
        {more ? "Hide options" : "More options"}
      </button>
      {more ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title (optional)"
            maxLength={100}
            className="field"
            aria-label="Title"
          />
          <div className="flex items-center rounded-[0.875rem] border border-line bg-night pl-3 focus-within:border-paper">
            <span className="shrink-0 text-sm text-mute">{SHORT_PREFIX}</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value.replace(/[^A-Za-z0-9_-]/g, ""))}
              placeholder="custom-code"
              maxLength={32}
              className="min-w-0 flex-1 bg-transparent py-[0.65rem] pr-3 text-paper outline-none"
              aria-label="Custom short code"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-mute">
            <Switch checked={onPage} onChange={setOnPage} label="Show on my page" />
            Show on my page
          </label>
        </div>
      ) : null}
    </form>
  );
}

function EditLink({
  link,
  busy,
  onClose,
  onSave,
}: {
  link: LinkRow;
  busy: boolean;
  onClose: () => void;
  onSave: (input: { url: string; title: string; slug: string }) => void;
}) {
  const [url, setUrl] = useState(link.url);
  const [title, setTitle] = useState(link.title);
  const [slug, setSlug] = useState(link.slug);

  return (
    <Dialog title="Edit link" onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ url, title, slug });
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm">
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Destination URL
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="field" inputMode="url" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Short code
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value.replace(/[^A-Za-z0-9_-]/g, ""))}
            maxLength={32}
            className="field"
          />
          <span className="text-xs text-mute">Changing it breaks the old short link.</span>
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy || !url.trim() || slug.length < 3}>
            Save
          </button>
        </div>
      </form>
    </Dialog>
  );
}
