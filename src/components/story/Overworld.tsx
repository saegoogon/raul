"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { CAST, PLAYER_SPRITE } from "@/lib/story/cast";
import {
  MAPS,
  MAP_H,
  MAP_W,
  isSolid,
  type Face,
  type Place,
} from "@/lib/story/maps";
import type { CastId } from "@/lib/story/types";

const STEP: Record<Face, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const KEYS: Record<string, Face> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  W: "up",
  S: "down",
  A: "left",
  D: "right",
};

const TILE_CLASS: Record<string, string> = {
  "#": "t-wall",
  h: "t-house",
  o: "t-lamp",
  w: "t-well",
  ",": "t-dust",
  "*": "t-crack",
  "=": "t-stair",
};

export type Talk = { node: string; overlay: boolean; flag?: string };

export function Sprite({ who, className = "" }: { who: CastId; className?: string }) {
  if (who === "hider") return <span className={`ow-hider ${className}`} />;
  const cast = who === "player" ? null : CAST[who];
  if (!cast) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={cast.sprite} alt="" className={className} draggable={false} />
  );
}

export function Overworld({
  place,
  flags,
  active,
  onMove,
  onTalk,
}: {
  place: Place;
  flags: string[];
  active: boolean;
  onMove: (place: Place) => void;
  onTalk: (talk: Talk) => void;
}) {
  const map = MAPS[place.map];
  const [hold, setHold] = useState<Face | null>(null);
  const walking = active ? hold : null;
  const placeRef = useRef(place);
  const flagsRef = useRef(flags);
  const moveRef = useRef(onMove);
  const talkRef = useRef(onTalk);

  useLayoutEffect(() => {
    placeRef.current = place;
    flagsRef.current = flags;
    moveRef.current = onMove;
    talkRef.current = onTalk;
  });

  useEffect(() => {
    if (!active) return;
    const enter = map.onEnter;
    if (enter && !flagsRef.current.includes(enter.once)) {
      talkRef.current({ node: enter.node, overlay: !!enter.overlay, flag: enter.once });
    }
  }, [map, active]);

  const step = (face: Face) => {
    const current = placeRef.current;
    const here = MAPS[current.map];
    const [dx, dy] = STEP[face];
    const nx = current.x + dx;
    const ny = current.y + dy;
    const turned: Place = { ...current, face };
    const has = (flag: string) => flagsRef.current.includes(flag);

    const exit = here.exits.find((e) => e.x === nx && e.y === ny);
    if (exit) {
      if (exit.requires && !exit.requires.every(has)) {
        placeRef.current = turned;
        moveRef.current(turned);
        setHold(null);
        if (exit.blocked) talkRef.current({ node: exit.blocked, overlay: true });
        return;
      }
      const next: Place = { map: exit.to, x: exit.tx, y: exit.ty, face: exit.face };
      placeRef.current = next;
      moveRef.current(next);
      setHold(null);
      return;
    }

    const npcAt = here.npcs.some((npc) => npc.x === nx && npc.y === ny);
    if (isSolid(here, nx, ny) || npcAt) {
      placeRef.current = turned;
      moveRef.current(turned);
      return;
    }

    const next: Place = { ...turned, x: nx, y: ny };
    placeRef.current = next;
    moveRef.current(next);

    const trigger = here.triggers.find(
      (t) => t.x === nx && t.y === ny && (!t.once || !has(t.once)),
    );
    if (trigger) {
      setHold(null);
      talkRef.current({ node: trigger.node, overlay: !!trigger.overlay, flag: trigger.once });
    }
  };

  const interact = () => {
    const current = placeRef.current;
    const here = MAPS[current.map];
    const [dx, dy] = STEP[current.face];
    const tx = current.x + dx;
    const ty = current.y + dy;
    const npc = here.npcs.find((n) => n.x === tx && n.y === ty);
    if (npc) {
      const met = flagsRef.current.includes(npc.flag);
      setHold(null);
      talkRef.current({
        node: met ? npc.again : npc.talk,
        overlay: npc.overlay ?? true,
        flag: npc.flag,
      });
      return;
    }
    const look = here.looks.find((l) => l.x === tx && l.y === ty);
    if (look) {
      setHold(null);
      talkRef.current({ node: look.node, overlay: true });
    }
  };

  const stepRef = useRef(step);
  const interactRef = useRef(interact);

  useLayoutEffect(() => {
    stepRef.current = step;
    interactRef.current = interact;
  });

  useEffect(() => {
    if (!walking) return;
    stepRef.current(walking);
    const loop = window.setInterval(() => stepRef.current(walking), 150);
    return () => window.clearInterval(loop);
  }, [walking]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!active) return;
      const face = KEYS[event.key];
      if (face) {
        event.preventDefault();
        if (!event.repeat) setHold(face);
        return;
      }
      if (event.key === "z" || event.key === "Z" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!event.repeat) interactRef.current();
      }
    };
    const up = (event: KeyboardEvent) => {
      const face = KEYS[event.key];
      if (face) setHold((current) => (current === face ? null : current));
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [active]);

  const pad = (face: Face) => ({
    onPointerDown: (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (active) setHold(face);
    },
    onPointerUp: () => setHold(null),
    onPointerLeave: () => setHold(null),
    onPointerCancel: () => setHold(null),
  });

  return (
    <div className="ow">
      <div
        className={`ow-map map-${map.id}`}
        style={{ "--cols": MAP_W, "--rows": MAP_H } as CSSProperties}
      >
        {map.tiles.map((row, y) =>
          row.split("").map((char, x) => (
            <span key={`${x}-${y}`} className={`ow-tile ${TILE_CLASS[char] ?? "t-floor"}`} />
          )),
        )}

        {map.npcs.map((npc) => (
          <span
            key={npc.id}
            className="ow-actor"
            style={
              {
                "--x": npc.x,
                "--y": npc.y,
                zIndex: 10 + npc.y,
              } as CSSProperties
            }
          >
            <Sprite who={npc.who} className="ow-sprite" />
          </span>
        ))}

        <span
          key={`player-${place.map}`}
          className={`ow-actor ow-player face-${place.face}${walking ? " is-walking" : ""}`}
          style={
            {
              "--x": place.x,
              "--y": place.y,
              zIndex: 10 + place.y,
            } as CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PLAYER_SPRITE}
            alt="Blee"
            className="ow-sprite"
            draggable={false}
          />
        </span>

        <p key={`banner-${map.id}`} className="ow-banner">
          {map.name}
        </p>
      </div>

      {active ? (
        <div className="ow-controls">
          <div className="ow-pad" aria-label="Move">
            <button type="button" className="ow-key k-up" aria-label="Up" {...pad("up")} />
            <button type="button" className="ow-key k-left" aria-label="Left" {...pad("left")} />
            <button type="button" className="ow-key k-right" aria-label="Right" {...pad("right")} />
            <button type="button" className="ow-key k-down" aria-label="Down" {...pad("down")} />
          </div>
          <p className="ow-hint">Arrows move · Z talk · Esc menu</p>
          <button
            type="button"
            className="ow-act"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              interactRef.current();
            }}
          >
            Z
          </button>
        </div>
      ) : null}
    </div>
  );
}
