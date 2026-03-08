export interface RhythmUpdate {
  volume: number;       // 0-1 normalized
  isBreathing: boolean; // true = sound detected above threshold
  accuracy: number;     // 0-100 rhythm accuracy
  phase: "inhale" | "exhale" | "quiet";
}

type RhythmCallback = (update: RhythmUpdate) => void;

/**
 * Breath detection using Web Audio API (microphone).
 * Detects breathing sounds and compares timing to expected phase durations.
 * All processing is local — no data leaves the device.
 */
export class BreathDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private callback: RhythmCallback | null = null;

  // State
  private _volume = 0;
  private _isBreathing = false;
  private _phase: "inhale" | "exhale" | "quiet" = "quiet";

  // Rhythm tracking
  private volumeHistory: number[] = [];
  private transitionTimes: number[] = [];
  private lastTransitionTime = 0;
  private wasAboveThreshold = false;

  // Accuracy tracking
  private expectedPhaseDurations: number[] = [];
  private currentExpectedIndex = 0;
  private phaseStartTime = 0;
  private accuracySamples: number[] = [];

  private readonly THRESHOLD = 0.08;        // Volume threshold for breath detection
  private readonly SMOOTHING = 0.3;          // EMA smoothing factor
  private readonly HISTORY_SIZE = 60;        // ~1 second at 60fps

  get currentVolume() { return this._volume; }
  get isBreathing() { return this._isBreathing; }
  get rhythmAccuracy() {
    if (this.accuracySamples.length === 0) return 0;
    return Math.round(this.accuracySamples.reduce((a, b) => a + b, 0) / this.accuracySamples.length);
  }

  onRhythmUpdate(callback: RhythmCallback) {
    this.callback = callback;
  }

  /**
   * Set the expected phase durations for accuracy comparison.
   * e.g., [4, 4, 4, 4] for box breathing (inhale, hold, exhale, hold)
   */
  setExpectedPhases(durations: number[]) {
    this.expectedPhaseDurations = durations;
    this.currentExpectedIndex = 0;
    this.phaseStartTime = Date.now();
  }

  /**
   * Notify the detector that a new breathing phase has started.
   * Used to sync with the app's breathing timer.
   */
  notifyPhaseChange(phaseIndex: number) {
    if (this.expectedPhaseDurations.length === 0) return;

    const now = Date.now();
    if (this.phaseStartTime > 0) {
      const actualDuration = (now - this.phaseStartTime) / 1000;
      const expected = this.expectedPhaseDurations[this.currentExpectedIndex % this.expectedPhaseDurations.length];
      
      if (expected > 0) {
        // Accuracy = how close actual breathing aligns with expected timing
        const deviation = Math.abs(actualDuration - expected) / expected;
        const accuracy = Math.max(0, Math.min(100, 100 * (1 - deviation)));
        this.accuracySamples.push(accuracy);
        // Keep last 20 samples
        if (this.accuracySamples.length > 20) this.accuracySamples.shift();
      }
    }

    this.currentExpectedIndex = phaseIndex;
    this.phaseStartTime = now;
  }

  async start(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);

      this.loop();
      return true;
    } catch {
      return false;
    }
  }

  stop() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;

    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    this.analyser = null;
    this._volume = 0;
    this._isBreathing = false;
    this._phase = "quiet";
    this.volumeHistory = [];
    this.accuracySamples = [];
  }

  private loop = () => {
    if (!this.analyser) return;

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);

    // Calculate RMS volume from frequency bins (focus on low frequencies for breathing)
    const breathBins = data.slice(0, Math.floor(data.length * 0.4)); // Lower 40% of spectrum
    let sum = 0;
    for (let i = 0; i < breathBins.length; i++) {
      const normalized = breathBins[i] / 255;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / breathBins.length);

    // Exponential moving average smoothing
    this._volume = this._volume * (1 - this.SMOOTHING) + rms * this.SMOOTHING;

    // Track volume history
    this.volumeHistory.push(this._volume);
    if (this.volumeHistory.length > this.HISTORY_SIZE) this.volumeHistory.shift();

    // Detect breathing state
    const isAbove = this._volume > this.THRESHOLD;
    this._isBreathing = isAbove;

    // Detect transitions
    const now = Date.now();
    if (isAbove && !this.wasAboveThreshold) {
      // Quiet → loud = inhale start
      this._phase = "inhale";
      this.transitionTimes.push(now);
      if (this.transitionTimes.length > 20) this.transitionTimes.shift();
      this.lastTransitionTime = now;
    } else if (!isAbove && this.wasAboveThreshold) {
      // Loud → quiet = exhale end or hold
      this._phase = "quiet";
      this.lastTransitionTime = now;
    } else if (isAbove && (now - this.lastTransitionTime) > 500) {
      // Sustained sound = could be exhale
      const recentAvg = this.volumeHistory.length > 10
        ? this.volumeHistory.slice(-10).reduce((a, b) => a + b, 0) / 10
        : this._volume;
      
      // If volume is declining, likely exhale
      const oldAvg = this.volumeHistory.length > 20
        ? this.volumeHistory.slice(-20, -10).reduce((a, b) => a + b, 0) / 10
        : recentAvg;
      
      this._phase = recentAvg < oldAvg ? "exhale" : "inhale";
    }

    this.wasAboveThreshold = isAbove;

    // Calculate real-time accuracy based on volume pattern matching
    let accuracy = this.rhythmAccuracy;
    if (this.transitionTimes.length >= 3 && this.expectedPhaseDurations.length > 0) {
      const intervals: number[] = [];
      for (let i = 1; i < this.transitionTimes.length; i++) {
        intervals.push((this.transitionTimes[i] - this.transitionTimes[i - 1]) / 1000);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const expectedCycle = this.expectedPhaseDurations.reduce((a, b) => a + b, 0) / (this.expectedPhaseDurations.length / 2);
      const deviation = Math.abs(avgInterval - expectedCycle) / expectedCycle;
      accuracy = Math.max(0, Math.min(100, Math.round(100 * (1 - deviation))));
    }

    // Fire callback
    this.callback?.({
      volume: this._volume,
      isBreathing: this._isBreathing,
      accuracy,
      phase: this._phase,
    });

    this.rafId = requestAnimationFrame(this.loop);
  };
}
