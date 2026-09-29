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
