"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { saveStory } from "@/actions/story";
import { CAST } from "@/lib/story/cast";
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
  const [nodeId, setNodeId] = useState(
    fresh ? STORY_START : (initial?.nodeId ?? STORY_START),
  );
  const [flags, setFlags] = useState<string[]>(fresh ? [] : (initial?.flags ?? []));
  const [meter, setMeter] = useState(fresh ? 0 : (initial?.meter ?? 0));
  const [shown, setShown] = useState("");
  const [phase, setPhase] = useState<"line" | "menu" | "act">("line");
  const [actText, setActText] = useState("");
  const [busy, setBusy] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [veil, setVeil] = useState(false);
  const skip = useRef(false);
  const sceneRef = useRef<string>("wake");

  const node = useMemo(() => getNode(nodeId), [nodeId]);
  const pose = (node.pose ?? "sit") as Pose;
  const full = phase === "act" ? actText : node.text;
  const scene = node.scene ?? "wake";
  const typing = shown.length < full.length;

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
        setNodeId(local.nodeId);
        setFlags(local.flags ?? []);
        setMeter(local.meter ?? 0);
      }
    }
  }, [fresh, initial, loggedIn]);

  useEffect(() => {
    const save: StorySave = { nodeId, flags, meter };
    writeLocal(save);
    if (loggedIn) void saveStory(save);
  }, [nodeId, flags, meter, loggedIn]);

  useEffect(() => {
    if (sceneRef.current !== scene) {
      setVeil(true);
      const wait = window.setTimeout(() => {
        sceneRef.current = scene;
        setVeil(false);
      }, 240);
      return () => window.clearTimeout(wait);
    }
  }, [scene]);

  useEffect(() => {
    skip.current = false;
    setShown("");
    setPhase("line");
    setCursor(0);
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

  const go = useCallback(
    (next: string, flag?: string) => {
      const target = getNode(next);
      if (target.paid && !paid) {
        setNodeId("shop-1");
        setActText("");
        setPhase("line");
        return;
      }
      setFlags((current) =>
        flag && !current.includes(flag) ? [...current, flag] : current,
      );
      if (target.encounter) setMeter(0);
      setNodeId(next);
      setActText("");
      setPhase("line");
    },
    [paid],
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

  const spareReady = meter >= (node.encounter?.spareAt ?? 99);

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
            setNodeId(STORY_START);
            setFlags([]);
            setMeter(0);
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
    if (phase === "menu" && node.encounter) {
      return [
        ...node.encounter.acts.map((act) => ({
          id: act.label,
          label: act.label,
          run: () => {
            setActText(act.text);
            setPhase("act");
            if (act.meter) setMeter((value) => value + act.meter!);
            if (act.set) {
              setFlags((current) =>
                current.includes(act.set!) ? current : [...current, act.set!],
              );
            }
          },
        })),
        {
          id: "spare",
          label: node.encounter.spare.label,
          disabled: !spareReady,
          run: () => spareReady && go(node.encounter!.spare.next),
        },
        {
          id: "leave",
          label: node.encounter.leave.label,
          run: () => go(node.encounter!.leave.next),
        },
      ];
    }
    if (shown.length >= full.length && node.choices && phase === "line") {
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
    phase,
    node,
    spareReady,
    shown.length,
    full.length,
    paid,
    busy,
    go,
    buy,
  ]);

  const advance = useCallback(() => {
    if (paused) return;
    if (typing) {
      skip.current = true;
      setShown(full);
      return;
    }
    if (node.encounter && phase === "line") {
      setPhase("menu");
      return;
    }
    if (node.encounter && phase === "act") {
      setPhase("menu");
      return;
    }
    if (node.choices?.length || node.encounter || node.shop) return;
    if (node.next) go(node.next);
  }, [paused, typing, full, node, phase, go]);

  const back = useCallback(() => {
    if (paused) {
      setPaused(false);
      return;
    }
    if (typing) {
      skip.current = true;
      setShown(full);
      return;
    }
    if (phase === "act") {
      setPhase("menu");
    }
  }, [paused, typing, full, phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      nightSound.unlock();
      if (key === "Escape") {
        event.preventDefault();
        setPaused((value) => !value);
        return;
      }
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
          const item = items[Math.min(cursor, items.length - 1)];
          if (item && !item.disabled) item.run();
          return;
        }
      }
      if (key === "Enter" || key === "z" || key === "Z") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, cursor, typing, advance, back, paused]);

  useEffect(() => {
    setCursor(0);
  }, [items.length, paused, phase]);

  return (
    <div
      className={`story-stage scene-${scene}${paused ? " is-paused" : ""}`}
      onClick={() => {
        nightSound.unlock();
        if (!paused && items.length === 0) advance();
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

      <div className="story-sprite" aria-hidden>
        <CastSprite who={node.encounter?.who ?? node.who} pose={pose} />
      </div>

      {paused ? (
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
      ) : (
        <>
          <div
            className="story-box"
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              advance();
            }}
          >
            {node.speaker ? <p className="story-speaker">{node.speaker}</p> : null}
            {node.encounter && phase !== "line" ? (
              <p className="story-enemy">{node.encounter.name}</p>
            ) : null}
            <p className="story-line">
              <span aria-hidden>* </span>
              {shown}
              {typing ? <span className="story-caret">_</span> : null}
            </p>
            {node.encounter && phase === "menu" ? (
              <p className="story-meter" aria-label="understanding">
                {Array.from({ length: node.encounter.spareAt }, (_, index) => (
                  <i key={index} className={index < meter ? "on" : ""} />
                ))}
              </p>
            ) : null}
          </div>

          {items.length > 0 && !paused ? (
            <div
              className={`story-menu${node.encounter && phase === "menu" ? " story-acts" : ""}`}
              onClick={(event) => event.stopPropagation()}
            >
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
      )}
    </div>
  );
}
