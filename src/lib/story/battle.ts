import type { Pattern } from "@/lib/story/types";

export const ARENA = 200;
export const SOUL_R = 4;

export type Kind = "drop" | "blob" | "shard" | "void" | "beam";

export type Bullet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: Kind;
  life: number;
  bounce?: boolean;
  wobble?: number;
  w?: number;
  wait?: number;
  ttl?: number;
};

type Point = { x: number; y: number };

const EVERY: Record<Pattern, number> = {
  rain: 0.24,
  sweep: 0.8,
  ring: 1.2,
  bounce: 2.2,
  rise: 0.32,
  close: 1.5,
  pillars: 1.1,
  rows: 0.95,
  spiral: 0.07,
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function aimed(from: Point, to: Point, speed: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy) || 1;
  return { vx: (dx / d) * speed, vy: (dy / d) * speed };
}

function blob(soul: Point): Bullet {
  let x = rand(20, ARENA - 20);
  let y = rand(20, ARENA - 20);
  if (Math.hypot(x - soul.x, y - soul.y) < 60) {
    x = ARENA - x;
    y = ARENA - y;
  }
  const a = rand(0, Math.PI * 2);
  const speed = rand(55, 75);
  return {
    x,
    y,
    vx: Math.cos(a) * speed,
    vy: Math.sin(a) * speed,
    r: 8,
    kind: "blob",
    life: 0,
    bounce: true,
  };
}

function spawn(pattern: Pattern, index: number, soul: Point): Bullet[] {
  switch (pattern) {
    case "rain":
      return [
        {
          x: rand(8, ARENA - 8),
          y: -6,
          vx: 0,
          vy: rand(90, 135),
          r: 4,
          kind: "drop",
          life: 0,
        },
      ];
    case "rise":
      return [
        {
          x: rand(8, ARENA - 8),
          y: ARENA + 6,
          vx: 0,
          vy: -rand(80, 110),
          r: 4,
          kind: "drop",
          life: 0,
          wobble: rand(0, Math.PI * 2),
        },
      ];
    case "sweep": {
      const fromLeft = index % 2 === 0;
      const gap = rand(30, ARENA - 70);
      const out: Bullet[] = [];
      for (let y = 8; y < ARENA; y += 20) {
        if (y > gap && y < gap + 46) continue;
        out.push({
          x: fromLeft ? -8 : ARENA + 8,
          y,
          vx: fromLeft ? 85 : -85,
          vy: 0,
          r: 4,
          kind: "shard",
          life: 0,
        });
      }
      return out;
    }
    case "ring": {
      const out: Bullet[] = [];
      const turn = rand(0, Math.PI * 2);
      for (let i = 0; i < 6; i += 1) {
        const a = turn + (i / 6) * Math.PI * 2;
        const from = { x: ARENA / 2 + Math.cos(a) * 140, y: ARENA / 2 + Math.sin(a) * 140 };
        out.push({ ...from, ...aimed(from, soul, 72), r: 5, kind: "void", life: 0 });
      }
      return out;
    }
    case "bounce":
      return index < 4 ? [blob(soul)] : [];
    case "pillars": {
      const lanes = [20, 60, 100, 140, 180];
      const near = lanes.reduce((best, x) =>
        Math.abs(x - soul.x) < Math.abs(best - soul.x) ? x : best,
      );
      const other = lanes.filter((x) => x !== near)[Math.floor(rand(0, 4))];
      return [near, other].map((x) => ({
        x,
        y: ARENA / 2,
        vx: 0,
        vy: 0,
        r: 0,
        w: 30,
        kind: "beam" as const,
        life: 0,
        wait: 0.6,
        ttl: 0.95,
      }));
    }
    case "rows": {
      const out: Bullet[] = [];
      const gap = index % 2 === 0 ? rand(10, 70) : rand(110, 170);
      for (let x = 8; x < ARENA; x += 16) {
        if (x > gap && x < gap + 40) continue;
        out.push({ x, y: -6, vx: 0, vy: 70, r: 4, kind: "shard", life: 0 });
      }
      return out;
    }
    case "spiral": {
      const a = index * 0.5;
      const from = { x: ARENA / 2, y: 26 };
      return [0, Math.PI].map((turn) => ({
        ...from,
        vx: Math.cos(a + turn) * 62,
        vy: Math.sin(a + turn) * 62,
        r: 4,
        kind: "void" as const,
        life: 0,
      }));
    }
    case "close": {
      const out: Bullet[] = [];
      const count = 14;
      const hole = Math.floor(rand(0, count));
      for (let i = 0; i < count; i += 1) {
        if (i === hole || i === (hole + 1) % count) continue;
        const a = (i / count) * Math.PI * 2;
        const from = { x: soul.x + Math.cos(a) * 95, y: soul.y + Math.sin(a) * 95 };
        out.push({ ...from, ...aimed(from, soul, 48), r: 5, kind: "void", life: 0 });
      }
      return out;
    }
  }
}

export class Wave {
  bullets: Bullet[] = [];
  private fired: Partial<Record<Pattern, number>> = {};

  constructor(
    private patterns: Pattern[],
    soul: Point,
  ) {
    if (patterns.includes("bounce")) {
      this.bullets.push(blob(soul), blob(soul));
      this.fired.bounce = 0;
    }
  }

  step(t: number, dt: number, soul: Point) {
    for (const pattern of this.patterns) {
      const due = Math.floor(t / EVERY[pattern]);
      const done = this.fired[pattern] ?? -1;
      for (let i = done + 1; i <= due; i += 1) {
        this.bullets.push(...spawn(pattern, i, soul));
      }
      this.fired[pattern] = Math.max(done, due);
    }

    const margin = 150;
    this.bullets = this.bullets.filter((b) => {
      b.life += dt;
      if (b.wobble !== undefined) b.vx = Math.cos(b.life * 4 + b.wobble) * 45;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.bounce) {
        if (b.x < b.r || b.x > ARENA - b.r) {
          b.vx *= -1;
          b.x = Math.min(ARENA - b.r, Math.max(b.r, b.x));
        }
        if (b.y < b.r || b.y > ARENA - b.r) {
          b.vy *= -1;
          b.y = Math.min(ARENA - b.r, Math.max(b.r, b.y));
        }
      }
      if (b.life > (b.ttl ?? 7)) return false;
      return (
        b.x > -margin && b.x < ARENA + margin && b.y > -margin && b.y < ARENA + margin
      );
    });
  }

  hits(soul: Point) {
    return this.bullets.some((b) => {
      if (b.kind === "beam") {
        return b.life >= (b.wait ?? 0) && Math.abs(b.x - soul.x) < (b.w ?? 0) / 2 + SOUL_R - 2;
      }
      return Math.hypot(b.x - soul.x, b.y - soul.y) < b.r + SOUL_R - 1;
    });
  }
}

export function draw(
  ctx: CanvasRenderingContext2D,
  wave: Wave,
  soul: Point,
  blink: boolean,
) {
  ctx.clearRect(0, 0, ARENA, ARENA);
  for (const b of wave.bullets) {
    if (b.kind === "beam") {
      const w = b.w ?? 0;
      if (b.life < (b.wait ?? 0)) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(b.x - w / 2, 0, w, ARENA);
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(b.x - w / 2 + 0.5, 0.5, w - 1, ARENA - 1);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(b.x - w / 2, 0, w, ARENA);
      }
      continue;
    }
    if (b.x < -10 || b.x > ARENA + 10 || b.y < -10 || b.y > ARENA + 10) continue;
    ctx.beginPath();
    if (b.kind === "shard") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(b.x - 6, b.y - 1.5, 12, 3);
      continue;
    }
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    if (b.kind === "void") {
      ctx.fillStyle = "#000";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#bbb";
      ctx.stroke();
      continue;
    }
    ctx.fillStyle = b.kind === "blob" ? "#c8c8c8" : "#fff";
    ctx.fill();
    if (b.kind === "blob") {
      ctx.fillStyle = "#000";
      ctx.fillRect(b.x - 3.5, b.y - 2.5, 2, 2);
      ctx.fillRect(b.x + 1.5, b.y - 2.5, 2, 2);
      ctx.beginPath();
      ctx.arc(b.x, b.y + 0.5, 3, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }
  }

  if (blink) return;
  ctx.beginPath();
  ctx.arc(soul.x, soul.y, SOUL_R + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(soul.x, soul.y - 0.5, 2.8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "#000";
  ctx.stroke();
}
