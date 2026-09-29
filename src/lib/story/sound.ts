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
