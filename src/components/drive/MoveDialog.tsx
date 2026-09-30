"use client";

import { useEffect, useMemo, useState } from "react";
import { listFolders } from "@/actions/drive";
import { Dialog } from "@/components/drive/Dialog";
import { Icon } from "@/components/drive/Icon";

type Folder = { id: string; name: string; parent_id: string | null };

export function MoveDialog({
  ids,
  busy,
  onClose,
  onMove,
}: {
  ids: string[];
  busy: boolean;
  onClose: () => void;
  onMove: (target: string | null) => void;
}) {
  const [folders, setFolders] = useState<Folder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void listFolders().then((result) => {
      if (!alive) return;
      if (result.ok) setFolders(result.data);
      else setError(result.error);
    });
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!folders) return [];
    const moving = new Set(ids);
    const children = new Map<string | null, Folder[]>();
    for (const folder of folders) {
      const list = children.get(folder.parent_id) ?? [];
      list.push(folder);
      children.set(folder.parent_id, list);
    }
    const out: { folder: Folder; depth: number }[] = [];
    const walk = (parent: string | null, depth: number) => {
      const list = (children.get(parent) ?? []).sort((a, b) => a.name.localeCompare(b.name));
      for (const folder of list) {
        if (moving.has(folder.id)) continue;
        out.push({ folder, depth });
        walk(folder.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }, [folders, ids]);

  const option = (id: string | null, name: string, depth: number, root = false) => (
    <li key={id ?? "root"}>
      <button
        type="button"
        onClick={() => setTarget(id)}
        className={`flex w-full items-center gap-2 rounded-xl py-2 pr-3 text-left text-sm ${
          target === id ? "bg-paper text-night" : "hover:bg-night"
        }`}
        style={{ paddingLeft: `${0.75 + depth * 1.1}rem` }}
      >
        <Icon name={root ? "home" : "folder"} size={16} filled={!root} />
        <span className="truncate">{name}</span>
      </button>
    </li>
  );

  return (
    <Dialog title={`Move ${ids.length === 1 ? "item" : `${ids.length} items`}`} onClose={onClose}>
      <ul className="max-h-72 overflow-y-auto rounded-2xl bg-night/60 p-1.5">
        {option(null, "My Drive", 0, true)}
        {folders === null && !error ? <li className="px-3 py-2 text-sm text-mute">Loading folders…</li> : null}
        {error ? <li className="px-3 py-2 text-sm text-mute">{error}</li> : null}
        {rows.map(({ folder, depth }) => option(folder.id, folder.name, depth + 1))}
      </ul>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" disabled={busy} onClick={() => onMove(target)}>
          Move here
        </button>
      </div>
    </Dialog>
  );
}
