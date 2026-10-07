"use client";

import { useActionState } from "react";
import { createRoom } from "@/actions/community";

export function RoomForm() {
  const [state, action, pending] = useActionState(createRoom, null);
  return (
    <form action={action} className="composer">
      <label className="mute">
        Name
        <input name="name" className="field" required minLength={2} maxLength={40} />
      </label>
      <label className="mute">
        Slug
        <input name="slug" className="field" required minLength={2} maxLength={24} pattern="[a-z0-9_]+" placeholder="night" />
      </label>
      <label className="mute">
        Description
        <textarea name="description" className="field" rows={3} maxLength={280} />
      </label>
      {state?.error ? <p className="text-sm text-warn">{state.error}</p> : null}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Creating…" : "Create room"}
      </button>
    </form>
  );
}
