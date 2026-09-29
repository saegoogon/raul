import type { CastId } from "@/lib/story/types";

export type MapId = "village" | "under" | "stair";
export type Face = "up" | "down" | "left" | "right";
export type Place = { map: MapId; x: number; y: number; face: Face };

type Npc = {
  id: string;
  who: CastId;
  x: number;
  y: number;
  talk: string;
  again: string;
  flag: string;
  overlay?: boolean;
};

type Spot = {
  x: number;
  y: number;
  node: string;
  overlay?: boolean;
  once?: string;
};

type Exit = {
  x: number;
  y: number;
  to: MapId;
  tx: number;
  ty: number;
  face: Face;
  requires?: string[];
  blocked?: string;
};

export type MapDef = {
  id: MapId;
  name: string;
  tiles: string[];
  spawn: { x: number; y: number; face: Face };
  npcs: Npc[];
  triggers: Spot[];
  looks: Spot[];
  exits: Exit[];
  onEnter?: Spot & { once: string };
};

export const SOLID = new Set(["#", "h", "o", "w"]);

export const MAPS: Record<MapId, MapDef> = {
  village: {
    id: "village",
    name: "The Gray Village",
    tiles: [
      "###############",
      "#hhh..o..hhhh.#",
      "#hhh.....hhhh.#",
      "#.............#",
      "#..o.......o..#",
      "#.............#",
      "#.hhh.....,,,.#",
      "#.hhh.....,*,.#",
      "#.........,,,.#",
      "#......o......#",
      "###############",
    ],
    spawn: { x: 6, y: 5, face: "down" },
    npcs: [],
    triggers: [{ x: 11, y: 7, node: "n3", once: "fell" }],
    looks: [
      { x: 6, y: 1, node: "look-lamp", overlay: true },
      { x: 3, y: 4, node: "look-lamp", overlay: true },
      { x: 11, y: 4, node: "look-lamp", overlay: true },
      { x: 7, y: 9, node: "look-lamp", overlay: true },
      { x: 2, y: 2, node: "look-house", overlay: true },
      { x: 3, y: 2, node: "look-house", overlay: true },
      { x: 3, y: 7, node: "look-house", overlay: true },
      { x: 2, y: 7, node: "look-house", overlay: true },
      { x: 10, y: 2, node: "look-sign", overlay: true },
      { x: 11, y: 2, node: "look-sign", overlay: true },
    ],
    exits: [],
  },
  under: {
    id: "under",
    name: "Under the Gray",
    tiles: [
      "###############",
      "#.....#.......#",
      "#.....#.......#",
      "#.....#.......#",
      "#.............#",
      "##.####...##..#",
      "#.............#",
      "#.....w.......#",
      "#.............#",
      "#.............#",
      "#######=#######",
    ],
    spawn: { x: 7, y: 4, face: "down" },
    npcs: [
      {
        id: "nyang",
        who: "nyang",
        x: 2,
        y: 2,
        talk: "n7",
        again: "nyang-again",
        flag: "met-nyang",
      },
      {
        id: "jenny",
        who: "jenny",
        x: 10,
        y: 2,
        talk: "n11",
        again: "jenny-again",
        flag: "met-jenny",
      },
      {
        id: "flower",
        who: "flower",
        x: 9,
        y: 7,
        talk: "n14",
        again: "flower-again",
        flag: "met-flower",
      },
      {
        id: "hider",
        who: "hider",
        x: 2,
        y: 8,
        talk: "n17",
        again: "hider-again",
        flag: "met-hider",
      },
    ],
    triggers: [],
    looks: [{ x: 6, y: 7, node: "look-well", overlay: true }],
    exits: [
      {
        x: 7,
        y: 10,
        to: "stair",
        tx: 7,
        ty: 1,
        face: "down",
        requires: ["met-nyang", "met-jenny", "met-flower"],
        blocked: "stair-blocked",
      },
    ],
    onEnter: { x: 7, y: 4, node: "n7", overlay: true, once: "met-nyang" },
  },
  stair: {
    id: "stair",
    name: "The Colorless Stair",
    tiles: [
      "######...######",
      "######...######",
      "######...######",
      "######...######",
      "#####.....#####",
      "#####.....#####",
      "#####.....#####",
      "#####.....#####",
      "######...######",
      "######...######",
      "###############",
    ],
    spawn: { x: 7, y: 1, face: "down" },
    npcs: [
      {
        id: "slime",
        who: "slime",
        x: 7,
        y: 7,
        talk: "n20",
        again: "n20",
        flag: "met-slime",
        overlay: false,
      },
    ],
    triggers: [5, 6, 7, 8, 9].map((x) => ({ x, y: 5, node: "n20", once: "met-slime" })),
    looks: [],
    exits: [
      { x: 6, y: 0, to: "under", tx: 7, ty: 9, face: "up" },
      { x: 7, y: 0, to: "under", tx: 7, ty: 9, face: "up" },
      { x: 8, y: 0, to: "under", tx: 7, ty: 9, face: "up" },
    ],
    onEnter: { x: 7, y: 1, node: "stair-enter", overlay: true, once: "seen-stair" },
  },
};

export const MAP_W = 15;
export const MAP_H = 11;

export function spawnOf(map: MapId): Place {
  const { x, y, face } = MAPS[map].spawn;
  return { map, x, y, face };
}

export function isMapId(value: string | undefined): value is MapId {
  return !!value && value in MAPS;
}

export function isSolid(map: MapDef, x: number, y: number) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  return SOLID.has(map.tiles[y]?.[x] ?? "#");
}

export function encodePlace(nodeId: string, place: Place) {
  return `${nodeId}|${place.map}:${place.x}:${place.y}`;
}

export function decodePlace(raw: string | undefined, fallback: string) {
  if (!raw) return { nodeId: fallback, place: spawnOf("village") };
  const [id, loc] = raw.split("|");
  const [map, xs, ys] = (loc ?? "").split(":");
  const x = Number(xs);
  const y = Number(ys);
  const place =
    isMapId(map) && Number.isInteger(x) && Number.isInteger(y) && !isSolid(MAPS[map], x, y)
      ? { map, x, y, face: "down" as Face }
      : spawnOf("village");
  return { nodeId: id || fallback, place };
}
