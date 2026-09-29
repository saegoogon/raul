"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Sprite } from "@/components/story/Overworld";
import { PLAYER_SPRITE } from "@/lib/story/cast";
import { ARENA, draw, Wave } from "@/lib/story/battle";
import { nightSound } from "@/lib/story/sound";
import type { StoryNode } from "@/lib/story/types";

type Phase = "text" | "menu" | "sub" | "aim" | "strike" | "taunt" | "windup" | "dodge";
type Then = "menu" | "taunt" | "restart" | { end: string; set?: string };
type Tab = "fight" | "act" | "item" | "mercy";
type Option = { id: string; label: string; disabled?: boolean; run: () => void };
type Hit = { id: number; dmg: number; crit: boolean; miss: boolean };
type Anim = { kind: "hop" | "hurt" | "sway"; id: number };
type Cutin = { kind: "boss" | "crit"; id: number };

const TABS: { id: Tab; label: string }[] = [
  { id: "fight", label: "FIGHT" },
  { id: "act", label: "ACT" },
  { id: "item", label: "ITEM" },
  { id: "mercy", label: "MERCY" },
];

const PACK = [
  { id: "candy", label: "Gray Candy", heal: 8, count: 2, text: "It tastes like a Tuesday." },
  { id: "tea", label: "Cold Tea", heal: 15, count: 1, text: "Somebody made it for you, once." },
];

const SPEED = 105;
const MAX_HP = 20;
const AIM_MS = 1100;
const STRIKE_MS = 1100;
const WINDUP_MS = 800;
const BASE_DMG = 12;

export function Battle({
  node,
  paused,
  onFlag,
  onEnd,
}: {
  node: StoryNode;
  paused: boolean;
  onFlag: (flag?: string) => void;
  onEnd: (next: string, flag?: string) => void;
}) {
  const enc = node.encounter!;
  const foeMax = enc.hp ?? 0;
  const [phase, setPhase] = useState<Phase>("text");
  const [msg, setMsg] = useState<{ text: string; then: Then }>({
    text: node.text,
    then: "menu",
  });
  const [shown, setShown] = useState("");
  const [tab, setTab] = useState(0);
  const [pick, setPick] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [foeHp, setFoeHp] = useState(foeMax);
  const [meter, setMeter] = useState(0);
  const [turn, setTurn] = useState(0);
  const [pack, setPack] = useState(PACK);
  const [hurt, setHurt] = useState(0);
  const [anim, setAnim] = useState<Anim | null>(null);
  const [hit, setHit] = useState<Hit | null>(null);
  const [impact, setImpact] = useState(0);
  const [dead, setDead] = useState(false);
  const [intro, setIntro] = useState(!enc.boss);
  const [cutin, setCutin] = useState<Cutin | null>(enc.boss ? { kind: "boss", id: 0 } : null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef(new Set<string>());
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const pausedRef = useRef(paused);
  const hpRef = useRef(hp);
  const skip = useRef(false);
  const aimStart = useRef(0);
  const serial = useRef(0);

  useLayoutEffect(() => {
    pausedRef.current = paused;
    hpRef.current = hp;
  });

  const typing = phase === "text" && shown.length < msg.text.length;
  const spareReady = meter >= enc.spareAt;
  const low = foeMax > 0 && foeHp / foeMax <= 0.3;
  const flavor = spareReady
    ? `${enc.name} looks ready to be spared.`
    : low
      ? `${enc.name} is barely standing.`
      : (enc.flavor ?? `${enc.name} is watching you.`);

  useEffect(() => {
    if (enc.boss) nightSound.bossIntro();
    else nightSound.encounter();
    const off = window.setTimeout(() => setIntro(false), 700);
    return () => window.clearTimeout(off);
  }, [enc.boss]);

  useEffect(() => {
    if (!cutin) return;
    const off = window.setTimeout(() => setCutin(null), cutin.kind === "boss" ? 1600 : 700);
    return () => window.clearTimeout(off);
  }, [cutin]);

  useEffect(() => {
    if (phase !== "text") return;
    skip.current = false;
    let i = 0;
    const text = msg.text;
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
    }, 20);
    return () => window.clearInterval(tick);
  }, [msg, phase]);

  const say = useCallback((text: string, then: Then) => {
    setMsg({ text, then });
    setShown("");
    setPhase("text");
  }, []);

  const restart = useCallback(() => {
    setHp(MAX_HP);
    setFoeHp(foeMax);
    setMeter(0);
    setTurn(0);
    setPack(PACK);
    setTab(0);
    setPhase("menu");
  }, [foeMax]);

  const finishText = useCallback(() => {
    const then = msg.then;
    if (then === "menu") setPhase("menu");
    else if (then === "taunt") setPhase("taunt");
    else if (then === "restart") restart();
    else onEnd(then.end, then.set);
  }, [msg, onEnd, restart]);

  const endTurn = useCallback(() => {
    const next = turn + 1;
    if (enc.survive && next >= enc.survive.turns) {
      nightSound.spare();
      onEnd(enc.survive.next);
      return;
    }
    setTurn(next);
    setPhase("menu");
  }, [turn, enc, onEnd]);

  const strike = useCallback(
    (at: number | null) => {
      const pos = at === null ? 2 : (at - aimStart.current) / AIM_MS;
      const acc = pos > 1 ? 0 : Math.max(0, 1 - Math.abs(pos - 0.5) * 2);
      const miss = acc < 0.08;
      const crit = acc > 0.86;
      const dmg = miss ? 0 : Math.round(BASE_DMG * (0.45 + acc * 0.75) * (crit ? 1.6 : 1));
      serial.current += 1;
      setHit({ id: serial.current, dmg, crit, miss });
      setAnim({ kind: miss ? "sway" : "hurt", id: serial.current });
      if (miss) {
        nightSound.whiff();
      } else {
        nightSound.slash(crit);
        setImpact((value) => value + 1);
        if (crit) setCutin({ kind: "crit", id: serial.current });
        if (foeMax) setFoeHp((value) => Math.max(0, value - dmg));
      }
      setPhase("strike");
    },
    [foeMax],
  );

  useEffect(() => {
    if (phase !== "aim") return;
    const late = window.setTimeout(() => strike(null), AIM_MS + 60);
    return () => window.clearTimeout(late);
  }, [phase, strike]);

  useEffect(() => {
    if (phase !== "strike") return;
    const done = window.setTimeout(() => {
      if (foeMax && foeHp <= 0) {
        setDead(true);
        nightSound.defeat();
        const end = enc.defeat;
        say(
          enc.defeatText ?? `${enc.name} falls apart.`,
          end ? { end: end.next, set: end.set } : "menu",
        );
      } else if (!foeMax && hit && !hit.miss) {
        say("The blade passes straight through. There is nothing there to break.", "taunt");
      } else {
        setPhase("taunt");
      }
    }, STRIKE_MS);
    return () => window.clearTimeout(done);
  }, [phase, foeHp, foeMax, enc, hit, say]);

  useEffect(() => {
    if (phase === "taunt") {
      const go = window.setTimeout(() => setPhase("windup"), 1400);
      return () => window.clearTimeout(go);
    }
    if (phase === "windup") {
      nightSound.windup();
      const go = window.setTimeout(() => setPhase("dodge"), WINDUP_MS);
      return () => window.clearTimeout(go);
    }
  }, [phase]);

  const options: Option[] = useMemo(() => {
    if (phase !== "sub") return [];
    const which = TABS[tab].id;
    if (which === "act") {
      return enc.acts.map((act) => ({
        id: act.label,
        label: act.label,
        run: () => {
          if (act.meter) setMeter((value) => value + act.meter!);
          onFlag(act.set);
          serial.current += 1;
          setAnim({ kind: "hop", id: serial.current });
          say(act.text, "taunt");
        },
      }));
    }
    if (which === "item") {
      const left = pack.filter((item) => item.count > 0);
      if (!left.length) {
        return [{ id: "none", label: "(pockets empty)", disabled: true, run: () => {} }];
      }
      return left.map((item) => ({
        id: item.id,
        label: `${item.label} x${item.count}`,
        run: () => {
          const healed = Math.min(MAX_HP, hp + item.heal) - hp;
          nightSound.heal();
          setHp((value) => Math.min(MAX_HP, value + item.heal));
          setPack((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, count: entry.count - 1 } : entry,
            ),
          );
          say(`You eat the ${item.label}. ${item.text} HP +${healed}.`, "taunt");
        },
      }));
    }
    const mercy: Option[] = [
      {
        id: "spare",
        label: enc.spare.label,
        disabled: !spareReady,
        run: () => {
          nightSound.spare();
          say(enc.spareText ?? `You spare ${enc.name}. It stops wobbling and starts listening.`, {
            end: enc.spare.next,
            set: enc.spare.set,
          });
        },
      },
    ];
    if (enc.leave) {
      const leave = enc.leave;
      mercy.push({
        id: "leave",
        label: leave.label,
        run: () => say("You step around it and keep going.", { end: leave.next }),
      });
    } else {
      mercy.push({
        id: "run",
        label: "RUN",
        run: () => say("You try to run. Your legs forget how.", "taunt"),
      });
    }
    return mercy;
  }, [phase, tab, enc, pack, hp, spareReady, onFlag, say]);

  const openTab = useCallback((index: number) => {
    nightSound.select();
    setTab(index);
    setPick(0);
    if (TABS[index].id === "fight") {
      aimStart.current = performance.now();
      setPhase("aim");
      return;
    }
    setPhase("sub");
  }, []);

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === "Escape" || pausedRef.current) return;
      const lower = key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(lower)) {
        keys.current.add(lower);
      }
      const confirm = key === "Enter" || lower === "z" || key === " ";
      const cancel = lower === "x";
      if (phase === "dodge" || phase === "windup" || phase === "strike") {
        if (lower.startsWith("arrow") || key === " ") event.preventDefault();
        return;
      }
      if (confirm) event.preventDefault();
      if (confirm && event.repeat) return;

      if (phase === "aim") {
        if (confirm) strike(performance.now());
        return;
      }
      if (phase === "text") {
        if (!confirm) return;
        if (typing) {
          skip.current = true;
          setShown(msg.text);
        } else finishText();
        return;
      }
      if (phase === "taunt") {
        if (confirm) setPhase("windup");
        return;
      }
      if (phase === "menu") {
        if (lower === "arrowleft" || lower === "a") {
          event.preventDefault();
          nightSound.blip();
          setTab((value) => (value + TABS.length - 1) % TABS.length);
        } else if (lower === "arrowright" || lower === "d") {
          event.preventDefault();
          nightSound.blip();
          setTab((value) => (value + 1) % TABS.length);
        } else if (confirm) openTab(tab);
        return;
      }
      if (phase === "sub") {
        const count = options.length;
        if (cancel) {
          setPhase("menu");
        } else if (["arrowdown", "arrowright", "s", "d"].includes(lower)) {
          event.preventDefault();
          nightSound.blip();
          setPick((value) => (value + 1) % count);
        } else if (["arrowup", "arrowleft", "w", "a"].includes(lower)) {
          event.preventDefault();
          nightSound.blip();
          setPick((value) => (value - 1 + count) % count);
        } else if (confirm) {
          const option = options[Math.min(pick, count - 1)];
          if (option && !option.disabled) {
            nightSound.select();
            option.run();
          }
        }
      }
    };
    const onUp = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const onBlur = () => keys.current.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [phase, typing, msg, finishText, tab, openTab, options, pick, strike]);

  useEffect(() => {
    if (phase !== "dodge") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = ARENA * ratio;
    canvas.height = ARENA * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const soul = { x: ARENA / 2, y: ARENA * 0.62 };
    const attacks = enc.attacks[turn % enc.attacks.length] ?? ["rain"];
    const wave = new Wave(attacks, soul);
    const seconds = enc.seconds ?? 5;
    const damage = enc.damage ?? 3;
    let t = 0;
    let guard = 0;
    let last = performance.now();
    let frame = 0;
    let over = false;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current && !over) {
        t += dt;
        guard = Math.max(0, guard - dt);

        let dx = 0;
        let dy = 0;
        const held = keys.current;
        if (held.has("arrowleft") || held.has("a")) dx -= 1;
        if (held.has("arrowright") || held.has("d")) dx += 1;
        if (held.has("arrowup") || held.has("w")) dy -= 1;
        if (held.has("arrowdown") || held.has("s")) dy += 1;
        if (!dx && !dy && pointer.current) {
          const px = pointer.current.x - soul.x;
          const py = pointer.current.y - soul.y;
          const d = Math.hypot(px, py);
          if (d > 2) {
            dx = px / d;
            dy = py / d;
          }
        }
        const len = Math.hypot(dx, dy) || 1;
        soul.x = Math.min(ARENA - 6, Math.max(6, soul.x + (dx / len) * SPEED * dt));
        soul.y = Math.min(ARENA - 6, Math.max(6, soul.y + (dy / len) * SPEED * dt));

        wave.step(t, dt, soul);
        if (!guard && wave.hits(soul)) {
          guard = 0.9;
          nightSound.hit();
          wave.burst(soul);
          const left = Math.max(0, hpRef.current - damage);
          hpRef.current = left;
          setHp(left);
          setHurt((value) => value + 1);
          if (left <= 0) {
            over = true;
            keys.current.clear();
            say("Your smile flickers out. ...Then, stubbornly, it comes back. Try again.", "restart");
            return;
          }
        }
        if (t >= seconds) {
          over = true;
          endTurn();
          return;
        }
      }
      draw(ctx, wave, soul, guard > 0 && Math.floor(guard * 12) % 2 === 0, t / seconds);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [phase, turn, enc, say, endTurn]);

  const toArena = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = {
      x: ((event.clientX - rect.left) / rect.width) * ARENA,
      y: ((event.clientY - rect.top) / rect.height) * ARENA,
    };
  };

  const taunt = enc.taunts[turn % enc.taunts.length];
  const boxText =
    phase === "text" ? shown : phase === "menu" || phase === "sub" ? flavor : "";
  const striking = phase === "strike" && hit;
  const locked = !["menu", "sub"].includes(phase);

  const foeClass = [
    "bt-enemy",
    enc.boss ? "is-boss" : "",
    anim ? `is-${anim.kind}` : "",
    phase === "windup" ? "is-windup" : "",
    phase === "dodge" ? "is-attacking" : "",
    low ? "is-low" : "",
    dead ? "is-dead" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`bt${intro ? " is-intro" : ""}${phase === "windup" ? " is-windup" : ""}`}
      data-hurt={hurt % 2}
      onClick={(event) => event.stopPropagation()}
    >
      {impact ? <div key={`impact-${impact}`} className="bt-impact" aria-hidden /> : null}

      {cutin ? (
        <div key={`cutin-${cutin.id}`} className={`bt-cutin is-${cutin.kind}`} aria-hidden>
          <div className="bt-cutin-band">
            {cutin.kind === "boss" && enc.who ? (
              <Sprite who={enc.who} className="bt-cutin-img" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={PLAYER_SPRITE} alt="" className="bt-cutin-img" />
            )}
            <p className="bt-cutin-text">
              {cutin.kind === "boss" ? enc.name : "CRITICAL"}
            </p>
            {cutin.kind === "boss" ? <p className="bt-cutin-sub">BOSS BATTLE</p> : null}
          </div>
        </div>
      ) : null}

      <div className="bt-foe">
        <div
          className={`bt-lines${phase === "windup" || striking || cutin ? " on" : ""}`}
          aria-hidden
        />
        <div key={`foe-${anim?.id ?? 0}`} className={foeClass}>
          {enc.who === "null" ? (
            <span className="bt-null" aria-hidden />
          ) : enc.who ? (
            <Sprite who={enc.who} className="bt-enemy-img" />
          ) : null}
          {phase === "windup" ? <span className="bt-alert">!</span> : null}
        </div>

        {striking && !hit.miss ? (
          <svg
            key={`slash-${hit.id}`}
            className={`bt-slash${hit.crit ? " is-crit" : ""}`}
            viewBox="0 0 200 200"
            aria-hidden
          >
            <path d="M20 170 L180 30" />
            {hit.crit ? <path d="M30 40 L175 165" /> : null}
            {hit.crit ? <path d="M10 105 L190 95" /> : null}
          </svg>
        ) : null}

        {striking ? (
          <span
            key={`dmg-${hit.id}`}
            className={`bt-dmg${hit.miss ? " is-miss" : ""}${hit.crit ? " is-crit" : ""}`}
          >
            {hit.miss ? "MISS" : foeMax ? hit.dmg : "0"}
          </span>
        ) : null}

        {phase === "taunt" || phase === "windup" || phase === "dodge" ? (
          <p className="bt-bubble" role="status">
            {taunt}
          </p>
        ) : null}
      </div>

      <div className="bt-status">
        {enc.boss ? <span className="bt-boss">BOSS</span> : null}
        <span className="bt-name">{enc.name}</span>
        {foeMax ? (
          <span className="bt-foe-hp" aria-label={`enemy hp ${foeHp} of ${foeMax}`}>
            <i className="ghost" style={{ width: `${(foeHp / foeMax) * 100}%` }} />
            <i style={{ width: `${(foeHp / foeMax) * 100}%` }} />
          </span>
        ) : null}
        {enc.spareAt < 99 ? (
          <span className="story-meter bt-meter" aria-label="understanding">
            {Array.from({ length: enc.spareAt }, (_, index) => (
              <i key={index} className={index < meter ? "on" : ""} />
            ))}
          </span>
        ) : enc.survive ? (
          <span className="bt-survive">
            SURVIVE {Math.min(turn + 1, enc.survive.turns)} / {enc.survive.turns}
          </span>
        ) : null}
      </div>

      <div
        className={`bt-box${phase === "dodge" ? " is-dodge" : ""}`}
        onClick={() => {
          if (phase === "aim") strike(performance.now());
          else if (phase === "text") {
            if (typing) {
              skip.current = true;
              setShown(msg.text);
            } else finishText();
          } else if (phase === "taunt") setPhase("windup");
        }}
      >
        {phase === "dodge" ? (
          <canvas
            ref={canvasRef}
            className="bt-arena"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              toArena(event);
            }}
            onPointerMove={(event) => {
              if (pointer.current) toArena(event);
            }}
            onPointerUp={() => {
              pointer.current = null;
            }}
            onPointerCancel={() => {
              pointer.current = null;
            }}
          />
        ) : phase === "aim" || phase === "strike" ? (
          <div className="bt-aim">
            <span className="bt-aim-zone" />
            <span className="bt-aim-core" />
            <span
              className={`bt-aim-cursor${phase === "strike" ? " is-stopped" : ""}`}
              style={{ animationDuration: `${AIM_MS}ms` }}
            />
            <span className="bt-aim-label">Z / tap to strike</span>
          </div>
        ) : phase === "sub" ? (
          <div className="bt-options">
            {options.map((option, index) => (
              <button
                key={option.id}
                type="button"
                className={`bt-option${index === pick ? " is-on" : ""}`}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  nightSound.select();
                  option.run();
                }}
              >
                {option.label}
              </button>
            ))}
            <button type="button" className="bt-back" onClick={() => setPhase("menu")}>
              back (X)
            </button>
          </div>
        ) : (
          <p className="story-line">
            <span aria-hidden>* </span>
            {boxText}
            {typing ? <span className="story-caret">_</span> : null}
          </p>
        )}
      </div>

      <div className="bt-hp">
        <span>BLEE</span>
        <span className="bt-hp-bar" aria-hidden>
          <i style={{ width: `${(hp / MAX_HP) * 100}%` }} />
        </span>
        <span>
          HP {hp} / {MAX_HP}
        </span>
      </div>

      <div className="bt-tabs">
        {TABS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`bt-tab${!locked && index === tab ? " is-on" : ""}`}
            disabled={locked}
            onClick={() => openTab(index)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {phase === "dodge" ? (
        <p className="bt-hint">Arrows / WASD to dodge · drag on touch</p>
      ) : null}
    </div>
  );
}
