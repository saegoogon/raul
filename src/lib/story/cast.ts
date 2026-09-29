import type { CastId } from "@/lib/story/types";

export const CAST: Partial<
  Record<Exclude<CastId, "player">, { name: string; src: string }>
> = {
  nyang: { name: "Nyang", src: "/brand/cast/nyang.png" },
  jenny: { name: "Jenny", src: "/brand/cast/jenny.png" },
  flower: { name: "Flower", src: "/brand/cast/flower.png" },
  slime: { name: "Slime", src: "/brand/cast/slime.png" },
};
