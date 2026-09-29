import type { CastId } from "@/lib/story/types";

export const CAST: Partial<
  Record<Exclude<CastId, "player">, { name: string; src: string; sprite: string }>
> = {
  nyang: { name: "Nyang", src: "/brand/cast/nyang.png", sprite: "/brand/sprites/nyang.png" },
  jenny: { name: "Jenny", src: "/brand/cast/jenny.png", sprite: "/brand/sprites/jenny.png" },
  flower: { name: "Flower", src: "/brand/cast/flower.png", sprite: "/brand/sprites/flower.png" },
  slime: { name: "Slime", src: "/brand/cast/slime.png", sprite: "/brand/sprites/slime.png" },
  "white-king": {
    name: "White King",
    src: "/brand/sprites/white-king.png",
    sprite: "/brand/sprites/white-king.png",
  },
  "black-queen": {
    name: "Black Queen",
    src: "/brand/sprites/black-queen.png",
    sprite: "/brand/sprites/black-queen.png",
  },
};

export const PLAYER_SPRITE = "/brand/sprites/blee.png";
