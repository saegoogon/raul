"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProfile } from "@/actions/links";
import { Icon } from "@/components/Icon";
import type { Profile } from "@/lib/links";

export function PageEditor({ profile, links }: { profile: Profile; links: string[] }) {
  const router = useRouter();
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const name = displayName || username || "you";
  const dirty = username !== profile.username || displayName !== profile.display_name || bio !== profile.bio;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My page</h1>
        <p className="mt-1 text-sm text-mute">One link for everything you share. Put it in your bio.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <form
          className="surface flex flex-col gap-4 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            startTransition(async () => {
              const result = await updateProfile({ username, displayName, bio });
              setMessage(result.ok ? "Saved." : result.error);
              if (result.ok) router.refresh();
            });
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            Username
            <div className="flex items-center rounded-[0.875rem] border border-line bg-night pl-3 focus-within:border-paper">
              <span className="shrink-0 text-mute">blacksmile.co.kr/@</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                minLength={3}
                maxLength={20}
                required
                className="min-w-0 flex-1 bg-transparent py-[0.65rem] pr-3 text-paper outline-none"
              />
            </div>
            <span className="text-xs text-mute">Changing it changes your page address.</span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={60}
              placeholder={username}
              className="field"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Bio
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={280}
              rows={4}
              placeholder="A line or two about you"
              className="field resize-none"
            />
            <span className="self-end text-xs text-mute">{bio.length}/280</span>
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-mute" role="status">
              {message}
            </p>
            <button type="submit" className="btn-primary" disabled={pending || !dirty || username.length < 3}>
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-night p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-2xl font-semibold uppercase text-night">
                {name.slice(0, 1)}
              </div>
              <p className="mt-3 font-semibold">{name}</p>
              <p className="text-xs text-mute">@{username}</p>
              {bio ? <p className="mt-2 whitespace-pre-line text-xs text-paper/80">{bio}</p> : null}
            </div>
            <ul className="mt-5 flex flex-col gap-2">
              {links.slice(0, 6).map((title, index) => (
                <li key={`${title}-${index}`} className="truncate rounded-xl border border-line bg-ink px-3 py-2.5 text-center text-xs">
                  {title}
                </li>
              ))}
              {links.length === 0 ? (
                <li className="text-center text-xs text-mute">
                  No links on your page yet.{" "}
                  <Link href="/dashboard" className="text-paper underline">
                    Add one
                  </Link>
                </li>
              ) : null}
              {links.length > 6 ? <li className="text-center text-xs text-mute">+{links.length - 6} more</li> : null}
            </ul>
          </div>
          <a href={`/@${profile.username}`} target="_blank" rel="noopener" className="btn-ghost">
            <Icon name="external" size={16} />
            Open my page
          </a>
        </div>
      </div>
    </div>
  );
}
