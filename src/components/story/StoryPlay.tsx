"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { saveStory } from "@/actions/story";
import { CAST } from "@/lib/story/cast";
import { getNode } from "@/lib/story/night";
import {
  SAVE_KEY,
  STORY_START,
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

function readLocal(): StorySave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorySave;
    if (!parsed.nodeId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocal(save: StorySave) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // ignore
  }
}

export function StoryPlay({
  initial,
  paid,
  loggedIn,
}: {
  initial: StorySave | null;
  paid: boolean;
  loggedIn: boolean;
}) {
  const [nodeId, setNodeId] = useState(initial?.nodeId ?? STORY_START);
  const [flags, setFlags] = useState<string[]>(initial?.flags ?? []);
  const [meter, setMeter] = useState(initial?.meter ?? 0);
  const [shown, setShown] = useState("");
  const [phase, setPhase] = useState<"line" | "menu" | "act">("line");
  const [actText, setActText] = useState("");
  const [busy, setBusy] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const skip = useRef(false);

  const node = useMemo(() => getNode(nodeId), [nodeId]);
  const pose = (node.pose ?? "sit") as Pose;
  const full = phase === "act" ? actText : node.text;

  useEffect(() => {
    if (!initial) {
      const local = readLocal();
      if (local) {
        setNodeId(local.nodeId);
        setFlags(local.flags ?? []);
        setMeter(local.meter ?? 0);
      }
    }
  }, [initial]);

  useEffect(() => {
    const save: StorySave = { nodeId, flags, meter };
    writeLocal(save);
    if (loggedIn) void saveStory(save);
  }, [nodeId, flags, meter, loggedIn]);

  useEffect(() => {
    skip.current = false;
    setShown("");
    setPhase(node.encounter ? "line" : "line");
    let i = 0;
    const text = full;
    const tick = window.setInterval(() => {
      if (skip.current) {
        setShown(text);
        window.clearInterval(tick);
        return;
      }
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(tick);
    }, 16);
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

  const advance = () => {
    if (shown.length < full.length) {
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
  };

  const buy = async () => {
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
  };

  const spareReady = meter >= (node.encounter?.spareAt ?? 99);

  return (
    <div className="story-stage">
      <a href="/" className="story-exit">
        Close
      </a>
      <div className="story-sprite" aria-hidden>
        <CastSprite
          who={node.encounter?.who ?? node.who}
          pose={pose}
        />
      </div>

      <div
        className="story-box"
        role="button"
        tabIndex={0}
        onClick={advance}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "z" || event.key === "Z") {
            event.preventDefault();
            advance();
          }
        }}
      >
        {node.speaker ? (
          <p className="story-speaker">{node.speaker}</p>
        ) : null}
        <p className="story-line">
          <span aria-hidden>* </span>
          {shown}
          {shown.length < full.length ? <span className="story-caret">_</span> : null}
        </p>
      </div>

      {phase === "menu" && node.encounter ? (
        <div className="story-menu">
          <p className="story-enemy">{node.encounter.name}</p>
          <p className="story-meter" aria-label="understanding">
            {Array.from({ length: node.encounter.spareAt }, (_, index) => (
              <i key={index} className={index < meter ? "on" : ""} />
            ))}
          </p>
          <div className="story-acts">
            {node.encounter.acts.map((act) => (
              <button
                key={act.label}
                type="button"
                className="story-choice"
                onClick={() => {
                  setActText(act.text);
                  setPhase("act");
                  if (act.meter) setMeter((value) => value + act.meter!);
                  if (act.set) {
                    setFlags((current) =>
                      current.includes(act.set!) ? current : [...current, act.set!],
                    );
                  }
                }}
              >
                {act.label}
              </button>
            ))}
            <button
              type="button"
              className="story-choice"
              disabled={!spareReady}
              onClick={() => spareReady && go(node.encounter!.spare.next)}
            >
              {node.encounter.spare.label}
            </button>
            <button
              type="button"
              className="story-choice"
              onClick={() => go(node.encounter!.leave.next)}
            >
              {node.encounter.leave.label}
            </button>
          </div>
        </div>
      ) : null}

      {shown.length >= full.length && node.choices && phase === "line" ? (
        <div className="story-menu">
          {node.choices.map((choice) => (
            <button
              key={choice.label}
              type="button"
              className="story-choice"
              onClick={() => go(choice.next, choice.set)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      ) : null}

      {node.shop && shown.length >= full.length && !node.choices ? (
        <div className="story-menu">
          <button
            type="button"
            className="story-choice"
            disabled={busy || paid}
            onClick={() => void buy()}
          >
            {paid ? "True Night is open" : busy ? "Opening..." : "Unlock True Night"}
          </button>
          {paid ? (
            <button
              type="button"
              className="story-choice"
              onClick={() => go("c2-1")}
            >
              Enter the second night
            </button>
          ) : null}
          {shopError ? <p className="story-error">{shopError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
