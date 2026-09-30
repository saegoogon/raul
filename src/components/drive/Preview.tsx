"use client";

import { useEffect, useState } from "react";
import { fileUrl } from "@/actions/drive";
import { Icon } from "@/components/drive/Icon";
import { formatBytes, kindOf, type DriveItem, type FileKind } from "@/lib/drive";

const TEXT_LIMIT = 256 * 1024;

export function MediaView({ kind, url, name }: { kind: FileKind; url: string; name: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== "text") return;
    let alive = true;
    fetch(url)
      .then((response) => response.text())
      .then((body) => alive && setText(body.length > TEXT_LIMIT ? `${body.slice(0, TEXT_LIMIT)}\n…` : body))
      .catch(() => alive && setText("Could not load this file."));
    return () => {
      alive = false;
    };
  }, [kind, url]);

  if (kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="max-h-full max-w-full rounded-lg object-contain" />;
  }
  if (kind === "video") return <video src={url} controls autoPlay className="max-h-full max-w-full rounded-lg" />;
  if (kind === "audio") return <audio src={url} controls autoPlay className="w-full max-w-md" />;
  if (kind === "pdf") return <iframe src={url} title={name} className="h-full w-full rounded-lg bg-paper" />;
  if (kind === "text") {
    return (
      <pre className="h-full w-full max-w-4xl overflow-auto whitespace-pre-wrap break-words rounded-lg bg-ink p-5 text-sm text-paper">
        {text ?? "Loading…"}
      </pre>
    );
  }
  return null;
}

export function Preview({
  item,
  onClose,
  onDownload,
}: {
  item: DriveItem;
  onClose: () => void;
  onDownload: () => void;
}) {
  const kind = kindOf(item);
  const viewable = ["image", "video", "audio", "pdf", "text"].includes(kind);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!viewable) return;
    let alive = true;
    void fileUrl(item.id, false).then((result) => {
      if (!alive) return;
      if (result.ok) setUrl(result.data);
      else setError(result.error);
    });
    return () => {
      alive = false;
    };
  }, [item.id, viewable]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95" role="dialog" aria-modal aria-label={item.name}>
      <header className="flex items-center gap-3 px-4 py-3">
        <button type="button" aria-label="Close preview" onClick={onClose} className="rounded-full p-2 hover:bg-ink">
          <Icon name="close" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="text-xs text-mute">{formatBytes(item.size)}</p>
        </div>
        <button type="button" className="btn-ghost" onClick={onDownload}>
          <Icon name="download" size={18} />
          Download
        </button>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4" onClick={(event) => event.target === event.currentTarget && onClose()}>
        {!viewable ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Icon name={kind === "archive" ? "archive" : "file"} size={56} className="text-mute" />
            <p className="text-sm text-mute">No preview for this file type.</p>
            <button type="button" className="btn-primary" onClick={onDownload}>
              Download
            </button>
          </div>
        ) : error ? (
          <p className="text-sm text-mute">{error}</p>
        ) : url ? (
          <MediaView kind={kind} url={url} name={item.name} />
        ) : (
          <p className="text-sm text-mute">Loading…</p>
        )}
      </div>
    </div>
  );
}
