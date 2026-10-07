"use client";

import { useActionState } from "react";
import { createPost } from "@/actions/community";
import type { Room } from "@/lib/community/types";

export function SubmitForm({ rooms, preset }: { rooms: Room[]; preset: string }) {
  const [state, action, pending] = useActionState(createPost, null);
  return (
    <form action={action} className="composer">
      <label className="mute">
        Room
        <select name="room" className="field" defaultValue={preset || rooms[0]?.slug} required>
          {rooms.map((room) => (
            <option key={room.id} value={room.slug}>
              in/{room.slug} — {room.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mute">
        Title
        <input name="title" className="field" required minLength={2} maxLength={200} />
      </label>
      <label className="mute">
        Link (optional)
        <input name="url" className="field" type="url" placeholder="https://" />
      </label>
      <label className="mute">
        Text
        <textarea name="body" className="field" rows={8} maxLength={20000} />
      </label>
      {state?.error ? <p className="text-sm text-warn">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
