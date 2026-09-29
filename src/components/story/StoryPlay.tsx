"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { Battle } from "@/components/story/Battle";
import { Overworld, Sprite, type Talk } from "@/components/story/Overworld";
import { saveStory } from "@/actions/story";
import { CAST } from "@/lib/story/cast";
import {
  decodePlace,
  encodePlace,
  isMapId,
  spawnOf,
  type Place,
} from "@/lib/story/maps";
import { getNode } from "@/lib/story/night";
import { readLocal, writeLocal } from "@/lib/story/save";
import { nightSound } from "@/lib/story/sound";
import {
  STORY_START,
  emptySave,
  type CastId,
  type Pose,
  type StorySave,
} from "@/lib/story/types";

const ON_MAP = "@";

function CastSprite({
  who,
  pose,
}: {
  who?: CastId;
  pose?: Pose;
}) {
  if (!who || who === "player") {
    if (pose === "none") return null;
    return (
      <Mascot
        size="xl"
        pose={pose ?? "sit"}
        bob={pose === "wait"}
        className="mx-auto"
      />
    );
  }
  if (who === "hider") return <span className="ow-hider story-hider" />;

  const cast = CAST[who];
  if (!cast) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={cast.src} alt="" className="story-cast" />
  );
}

type MenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  run: () => void;
};

export function StoryPlay({
  initial,
  paid,
  loggedIn,
  fresh = false,
}: {
  initial: StorySave | null;
  paid: boolean;
  loggedIn: boolean;
  fresh?: boolean;
}) {
  const start = useMemo(
    () => decodePlace(fresh ? undefined : initial?.nodeId, STORY_START),
    [fresh, initial],
  );
  const [nodeId, setNodeId] = useState(start.nodeId);
  const [place, setPlace] = useState<Place>(start.place);
  const [overlay, setOverlay] = useState(false);
  const [flags, setFlags] = useState<string[]>(fresh ? [] : (initial?.flags ?? []));
  const [meter, setMeter] = useState(fresh ? 0 : (initial?.meter ?? 0));
  const [shown, setShown] = useState("");
  const [busy, setBusy] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [veil, setVeil] = useState(false);
  const skip = useRef(false);
  const stageRef = useRef<string>("");

  const onMap = nodeId === ON_MAP;
  const showMap = onMap || overlay;
  const node = useMemo(() => getNode(onMap ? STORY_START : nodeId), [nodeId, onMap]);
  const pose = (node.pose ?? "sit") as Pose;
  const inBattle = !onMap && !overlay && !!node.encounter;
  const full = onMap || inBattle ? "" : node.text;
  const scene = node.scene ?? "wake";
  const typing = shown.length < full.length;
  const stageKey = showMap
    ? `map-${place.map}`
    : inBattle
      ? `battle-${nodeId}`
      : `scene-${scene}`;

  useEffect(() => {
    nightSound.load();
    setMuted(nightSound.muted);
    nightSound.unlock();
    nightSound.startDrone();
    return () => nightSound.stopDrone();
  }, []);

  useEffect(() => {
    if (fresh) {
      writeLocal(emptySave());
      if (loggedIn) void saveStory(emptySave());
      window.history.replaceState(null, "", "/play");
      return;
    }
    if (!initial) {
      const local = readLocal();
      if (local) {
        const restored = decodePlace(local.nodeId, STORY_START);
        setNodeId(restored.nodeId);
        setPlace(restored.place);
        setFlags(local.flags ?? []);
        setMeter(local.meter ?? 0);
      }
    }
  }, [fresh, initial, loggedIn]);

  useEffect(() => {
    const save: StorySave = { nodeId: encodePlace(nodeId, place), flags, meter };
    writeLocal(save);
    if (!loggedIn) return;
    const push = window.setTimeout(() => void saveStory(save), 600);
    return () => window.clearTimeout(push);
  }, [nodeId, place, flags, meter, loggedIn]);

  useEffect(() => {
    if (stageRef.current && stageRef.current !== stageKey) {
      setVeil(true);
      const wait = window.setTimeout(() => setVeil(false), 240);
      stageRef.current = stageKey;
      return () => window.clearTimeout(wait);
    }
    stageRef.current = stageKey;
  }, [stageKey]);

  useEffect(() => {
    skip.current = false;
    setShown("");
    setCursor(0);
    if (!full) return;
    let i = 0;
    const text = full;
    const tick = window.setInterval(() => {
      if (skip.current) {
        setShown(text);
        window.clearInterval(tick);
        return;
      }
      i += 1;
      nightSound.tick();
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(tick);
    }, 18);
    return () => window.clearInterval(tick);
  }, [nodeId, full]);

  const addFlag = useCallback((flag?: string) => {
    if (!flag) return;
    setFlags((current) => (current.includes(flag) ? current : [...current, flag]));
  }, []);

  const go = useCallback(
    (next: string, flag?: string) => {
      addFlag(flag);

      if (next === STORY_START) {
        setFlags([]);
        setMeter(0);
        setPlace(spawnOf("village"));
        setOverlay(false);
        setNodeId(STORY_START);
        return;
      }

      if (next.startsWith(ON_MAP)) {
        const target = next.slice(1);
        if (isMapId(target)) setPlace(spawnOf(target));
        setOverlay(false);
        setNodeId(ON_MAP);
        return;
      }

      const target = getNode(next);
      if (target.paid && !paid) {
        setOverlay(false);
        setNodeId("shop-1");
        return;
      }
      if (target.encounter) {
        setMeter(0);
        setOverlay(false);
      }
      setNodeId(next);
    },
    [paid, addFlag],
  );

  const talk = useCallback(
    ({ node: next, overlay: over, flag }: Talk) => {
      addFlag(flag);
      setOverlay(over);
      go(next);
    },
    [addFlag, go],
  );

  const buy = useCallback(async () => {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    setShopError(null);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setShopError(
        data.error ?? "Payments are not connected yet. Add Stripe keys on Vercel.",
      );
    } catch {
      setShopError("Could not start checkout.");
    } finally {
      setBusy(false);
    }
  }, [loggedIn]);

  const items: MenuItem[] = useMemo(() => {
    if (paused) {
      return [
        { id: "resume", label: "Continue", run: () => setPaused(false) },
        {
          id: "new",
          label: "New Game",
          run: () => {
            const save = emptySave();
            writeLocal(save);
            if (loggedIn) void saveStory(save);
            go(STORY_START);
            setPaused(false);
          },
        },
        {
          id: "mute",
          label: muted ? "Sound: off" : "Sound: on",
          run: () => {
            nightSound.setMuted(!muted);
            setMuted(!muted);
          },
        },
        {
          id: "title",
          label: "Title",
          run: () => {
            window.location.href = "/";
          },
        },
      ];
    }
    if (onMap || inBattle) return [];
    if (shown.length >= full.length && node.choices) {
      return node.choices.map((choice) => ({
        id: choice.label,
        label: choice.label,
        run: () => go(choice.next, choice.set),
      }));
    }
    if (node.shop && shown.length >= full.length && !node.choices) {
      const shop: MenuItem[] = [
        {
          id: "buy",
          label: paid
            ? "True Night is open"
            : busy
              ? "Opening..."
              : "Unlock True Night",
          disabled: busy || paid,
          run: () => void buy(),
        },
      ];
      if (paid) {
        shop.push({
          id: "enter",
          label: "Enter the second night",
          run: () => go("c2-1"),
        });
      }
      return shop;
    }
    return [];
  }, [
    paused,
    muted,
    loggedIn,
    onMap,
    inBattle,
    node,
    shown.length,
    full.length,
    paid,
    busy,
    go,
    buy,
  ]);

  const advance = useCallback(() => {
    if (paused || onMap || inBattle) return;
    if (typing) {
      skip.current = true;
      setShown(full);
      return;
    }
    if (node.choices?.length || node.shop) return;
    go(node.next ?? ON_MAP);
  }, [paused, onMap, inBattle, typing, full, node, go]);

  const back = useCallback(() => {
    if (paused) {
      setPaused(false);
      return;
    }
    if (typing) {
      skip.current = true;
      setShown(full);
    }
  }, [paused, typing, full]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      nightSound.unlock();
      if (key === "Escape") {
        event.preventDefault();
        setPaused((value) => !value);
        return;
      }
      if ((onMap || inBattle) && !paused) return;
      if (key === "x" || key === "X") {
        event.preventDefault();
        back();
        return;
      }
      const menuLive = paused || (items.length > 0 && !typing);
      if (menuLive) {
        if (key === "ArrowDown" || key === "ArrowRight") {
          event.preventDefault();
          setCursor((value) => (value + 1) % items.length);
          return;
        }
        if (key === "ArrowUp" || key === "ArrowLeft") {
          event.preventDefault();
          setCursor((value) => (value - 1 + items.length) % items.length);
          return;
        }
        if (key === "Enter" || key === "z" || key === "Z") {
          event.preventDefault();
          if (event.repeat) return;
          const item = items[Math.min(cursor, items.length - 1)];
          if (item && !item.disabled) item.run();
          return;
        }
      }
      if (key === "Enter" || key === "z" || key === "Z") {
        event.preventDefault();
        if (event.repeat) return;
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, cursor, typing, advance, back, paused, onMap, inBattle]);

  useEffect(() => {
    setCursor(0);
  }, [items.length, paused]);

  const who = node.who;

  const pauseMenu = (
    <div className="story-pause" onClick={(event) => event.stopPropagation()}>
      <p className="story-enemy">Paused</p>
      <div className="story-menu">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`story-choice${index === cursor ? " is-on" : ""}`}
            disabled={item.disabled}
            onClick={item.run}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  const dialogue = (
    <>
      <div
        className={`story-box${overlay ? " has-face" : ""}`}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          advance();
        }}
      >
        {overlay && who && who !== "player" ? (
          <span className="story-face" aria-hidden>
            <Sprite who={who} className="story-face-img" />
          </span>
        ) : null}
        <div className="story-text">
          {node.speaker ? <p className="story-speaker">{node.speaker}</p> : null}
          <p className="story-line">
            <span aria-hidden>* </span>
            {shown}
            {typing ? <span className="story-caret">_</span> : null}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="story-menu" onClick={(event) => event.stopPropagation()}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`story-choice${index === cursor ? " is-on" : ""}`}
              disabled={item.disabled}
              onClick={item.run}
            >
              {item.label}
            </button>
          ))}
          {shopError ? <p className="story-error">{shopError}</p> : null}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className={`story-stage ${showMap ? "is-map" : inBattle ? "is-battle" : `scene-${scene}`}${paused ? " is-paused" : ""}`}
      onClick={() => {
        nightSound.unlock();
        if (!paused && !onMap && !inBattle && items.length === 0) advance();
      }}
    >
      <div className={`story-veil${veil ? " on" : ""}`} />
      <button
        type="button"
        className="story-exit"
        onClick={(event) => {
          event.stopPropagation();
          setPaused(true);
        }}
      >
        Menu
      </button>

      {showMap ? (
        <>
          <Overworld
            place={place}
            flags={flags}
            active={onMap && !paused}
            onMove={setPlace}
            onTalk={talk}
          />
          {paused ? pauseMenu : onMap ? null : <div className="ow-dialogue">{dialogue}</div>}
        </>
      ) : inBattle ? (
        <>
          <Battle key={nodeId} node={node} paused={paused} onFlag={addFlag} onEnd={go} />
          {paused ? pauseMenu : null}
        </>
      ) : (
        <>
          <div className="story-sprite" aria-hidden>
            <CastSprite who={who} pose={pose} />
          </div>
          {paused ? pauseMenu : dialogue}
        </>
      )}
    </div>
  );
}
