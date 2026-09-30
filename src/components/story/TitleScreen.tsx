"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { saveStory } from "@/actions/story";
import { signOut } from "@/actions/auth";
import { BrandMark } from "@/components/BrandMark";
import { Mascot } from "@/components/Mascot";
import { useAuth } from "@/components/Providers";
import { emptySave } from "@/lib/story/types";
import { hasLocalSave, writeLocal } from "@/lib/story/save";
import { nightSound } from "@/lib/story/sound";

export function TitleScreen({ cloudSave }: { cloudSave: boolean }) {
  const { userId, username } = useAuth();
  const [localSave, setLocalSave] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    nightSound.load();
    setLocalSave(hasLocalSave());
  }, []);

  const canContinue = cloudSave || localSave;

  const begin = async (fresh: boolean) => {
    nightSound.unlock();
    setBusy(true);
    if (fresh) {
      const save = emptySave();
      writeLocal(save);
      if (userId) await saveStory(save);
      window.location.href = "/play?new=1";
      return;
    }
    window.location.href = "/play";
  };

  return (
    <div className="title-stage">
      <Mascot size="xl" pose="sit" bob priority className="mx-auto" />
      <p className="title-mark">
        <BrandMark />
      </p>
      <p className="title-tag">A small smile can change your world</p>

      <div className="title-menu">
        {canContinue ? (
          <button
            type="button"
            className="story-choice"
            disabled={busy}
            onClick={() => void begin(false)}
          >
            Continue
          </button>
        ) : null}
        <button
          type="button"
          className="story-choice"
          disabled={busy}
          onClick={() => void begin(true)}
        >
          New Game
        </button>
        <Link href="/shop" className="story-choice">
          Full Game
        </Link>
        {userId ? (
          <form action={signOut}>
            <button type="submit" className="story-choice">
              Log out{username ? ` · ${username}` : ""}
            </button>
          </form>
        ) : (
          <Link href="/login" className="story-choice">
            Log in
          </Link>
        )}
      </div>
    </div>
  );
}
