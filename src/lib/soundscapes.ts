export type SoundscapeType = "off" | "rain" | "ocean" | "wind";

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private animFrameId: number | null = null;
  private currentType: SoundscapeType = "off";
  private targetVolume = 0.5;
  private timeoutIds: ReturnType<typeof setTimeout>[] = [];

  start(type: SoundscapeType, volume = 0.5) {
    this.stop();
    if (type === "off") return;

    this.currentType = type;
    this.targetVolume = volume;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1);
    this.masterGain.connect(this.ctx.destination);

    switch (type) {
      case "rain": this.createRain(); break;
      case "ocean": this.createOcean(); break;
      case "wind": this.createWind(); break;
    }
  }

  stop() {
    // Clear all scheduled timeouts immediately
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.currentType = "off";

    // Capture old references before clearing
    const oldNodes = this.nodes;
    const oldCtx = this.ctx;
    const oldGain = this.masterGain;

    // Clear instance references immediately so start() gets fresh state
    this.nodes = [];
    this.ctx = null;
    this.masterGain = null;

    // Fade out and clean up old resources
    if (oldGain && oldCtx) {
      try { oldGain.gain.linearRampToValueAtTime(0, oldCtx.currentTime + 0.5); } catch { /* ignore */ }
    }

    setTimeout(() => {
      oldNodes.forEach(n => {
        try {
          if (n instanceof AudioBufferSourceNode || n instanceof OscillatorNode) n.stop();
          n.disconnect();
        } catch { /* empty */ }
      });
      try { oldCtx?.close(); } catch { /* empty */ }
    }, 600);
  }

  setVolume(v: number) {
    this.targetVolume = v;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.1);
    }
  }

  syncToPhase(phase: string) {
    if (!this.ctx || !this.masterGain) return;
    const base = this.targetVolume;
    const t = this.ctx.currentTime;
    if (this.currentType === "ocean") {
      const mod = phase === "exhale" ? 1.15 : phase === "inhale" ? 0.85 : 1;
      this.masterGain.gain.linearRampToValueAtTime(base * mod, t + 0.5);
    } else if (this.currentType === "rain") {
      const mod = phase === "inhale" ? 0.8 : phase === "exhale" ? 1.1 : 1;
      this.masterGain.gain.linearRampToValueAtTime(base * mod, t + 0.5);
    } else if (this.currentType === "wind") {
      const mod = phase === "exhale" ? 1.2 : phase === "hold" ? 0.7 : 1;
      this.masterGain.gain.linearRampToValueAtTime(base * mod, t + 0.5);
    }
  }

  getType() { return this.currentType; }

  private scheduleTimeout(fn: () => void, delay: number) {
    const id = setTimeout(() => {
      // Remove this ID from tracking after it fires
      const idx = this.timeoutIds.indexOf(id);
      if (idx >= 0) this.timeoutIds.splice(idx, 1);
      fn();
    }, delay);
    this.timeoutIds.push(id);
    return id;
  }

  private createNoiseBuffer(type: "white" | "brown" | "pink"): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === "brown") {
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
      }
    } else {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    this.nodes.push(source);
    return source;
  }

  private createRain() {
    const ctx = this.ctx!;
    const gain = this.masterGain!;

    const noise = this.createNoiseBuffer("white");
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2500;
    bp.Q.value = 0.5;
    this.nodes.push(bp);

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.6;
    this.nodes.push(rainGain);

    noise.connect(bp).connect(rainGain).connect(gain);
    noise.start();

    const scheduleDrops = () => {
      if (!this.ctx || this.currentType !== "rain") return;
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const delay = Math.random() * 2;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 2000 + Math.random() * 3000;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now + delay);
        env.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.04, now + delay + 0.005);
        env.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
        osc.connect(env).connect(gain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      }
      this.scheduleTimeout(scheduleDrops, 2000);
    };
    scheduleDrops();
  }

  private createOcean() {
    const ctx = this.ctx!;
    const gain = this.masterGain!;

    const noise = this.createNoiseBuffer("brown");
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    this.nodes.push(lp);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.14;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.3;
    this.nodes.push(lfo, lfoGain);

    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.7;
    this.nodes.push(waveGain);

    lfo.connect(lfoGain).connect(waveGain.gain);
    noise.connect(lp).connect(waveGain).connect(gain);
    noise.start();
    lfo.start();

    const foam = this.createNoiseBuffer("white");
    const foamBP = ctx.createBiquadFilter();
    foamBP.type = "highpass";
    foamBP.frequency.value = 3000;
    const foamGain = ctx.createGain();
    foamGain.gain.value = 0.08;
    this.nodes.push(foamBP, foamGain);

    const foamLFO = ctx.createOscillator();
    foamLFO.type = "sine";
    foamLFO.frequency.value = 0.12;
    const foamLFOGain = ctx.createGain();
    foamLFOGain.gain.value = 0.06;
    this.nodes.push(foamLFO, foamLFOGain);

    foamLFO.connect(foamLFOGain).connect(foamGain.gain);
    foam.connect(foamBP).connect(foamGain).connect(gain);
    foam.start();
    foamLFO.start();
  }

  private createWind() {
    const ctx = this.ctx!;
    const gain = this.masterGain!;

    const noise = this.createNoiseBuffer("pink");
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 600;
    this.nodes.push(lp);

    const windGain = ctx.createGain();
    windGain.gain.value = 0.7;
    this.nodes.push(windGain);

    noise.connect(lp).connect(windGain).connect(gain);
    noise.start();

    const modulateCutoff = () => {
      if (!this.ctx || this.currentType !== "wind") return;
      const target = 300 + Math.random() * 800;
      lp.frequency.linearRampToValueAtTime(target, ctx.currentTime + 3 + Math.random() * 4);
      this.scheduleTimeout(modulateCutoff, 3000 + Math.random() * 4000);
    };
    modulateCutoff();

    const scheduleGust = () => {
      if (!this.ctx || this.currentType !== "wind") return;
      const now = ctx.currentTime;
      const delay = 4 + Math.random() * 8;
      windGain.gain.linearRampToValueAtTime(0.9 + Math.random() * 0.3, now + delay);
      windGain.gain.linearRampToValueAtTime(0.7, now + delay + 2 + Math.random() * 2);
      this.scheduleTimeout(scheduleGust, (delay + 4) * 1000);
    };
    scheduleGust();
  }
}

// Singleton
let engineInstance: SoundscapeEngine | null = null;
export function getSoundscapeEngine(): SoundscapeEngine {
  if (!engineInstance) engineInstance = new SoundscapeEngine();
  return engineInstance;
}
