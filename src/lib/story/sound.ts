const MUTE_KEY = "blacksmile-mute";

function quiet() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

class NightSound {
  private ctx: AudioContext | null = null;
  private drone: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  muted = false;
  private ticks = 0;

  load() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      this.muted = false;
    }
  }

  setMuted(next: boolean) {
    this.muted = next;
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    if (next) this.stopDrone();
    else this.startDrone();
  }

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  tick() {
    if (this.muted || quiet() || !this.ctx) return;
    this.ticks += 1;
    if (this.ticks % 3 !== 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 720;
    gain.gain.value = 0.018;
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.018);
  }

  private tone(freq: number, seconds: number, type: OscillatorType, volume: number, to?: number) {
    if (this.muted || quiet() || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, now + seconds);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + seconds);
  }

  private noise(seconds: number, volume: number, from: number, to: number) {
    if (this.muted || quiet() || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(from, now);
    filter.frequency.exponentialRampToValueAtTime(to, now + seconds);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(now);
  }

  slash(crit: boolean) {
    this.noise(0.18, 0.22, 5200, 600);
    this.tone(crit ? 240 : 160, 0.3, "square", 0.05, 40);
    if (crit) {
      window.setTimeout(() => this.noise(0.16, 0.2, 6000, 900), 90);
      window.setTimeout(() => this.noise(0.16, 0.2, 4000, 500), 180);
    }
  }

  whiff() {
    this.noise(0.22, 0.08, 1800, 400);
  }

  windup() {
    this.tone(120, 0.6, "sawtooth", 0.025, 520);
  }

  defeat() {
    this.tone(400, 0.9, "square", 0.04, 50);
    this.noise(0.8, 0.1, 2000, 100);
  }

  bossIntro() {
    this.tone(55, 1.2, "sawtooth", 0.05, 110);
    this.noise(0.5, 0.12, 300, 4000);
  }

  blip() {
    this.tone(540, 0.05, "square", 0.02);
  }

  select() {
    this.tone(660, 0.09, "square", 0.025, 990);
  }

  hit() {
    this.tone(180, 0.22, "sawtooth", 0.05, 60);
  }

  heal() {
    this.tone(520, 0.3, "triangle", 0.05, 1040);
  }

  encounter() {
    this.tone(880, 0.35, "square", 0.03, 110);
  }

  spare() {
    this.tone(440, 0.5, "triangle", 0.05, 880);
  }

  startDrone() {
    if (this.muted || quiet() || !this.ctx || this.drone) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 52;
    gain.gain.value = 0.012;
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    this.drone = osc;
    this.droneGain = gain;
  }

  stopDrone() {
    try {
      this.drone?.stop();
    } catch {
      // ignore
    }
    this.drone = null;
    this.droneGain = null;
  }
}

export const nightSound = new NightSound();
