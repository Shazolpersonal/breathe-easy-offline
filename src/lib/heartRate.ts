export interface HeartRateData {
  bpm: number | null;
  signalQuality: number; // 0-100
  coherence: number;     // 0-100, coherence with breathing
  isReady: boolean;
}

type HeartRateCallback = (data: HeartRateData) => void;

/**
 * Heart rate estimation via camera (photoplethysmography / PPG).
 * Uses the rear camera + torch to detect pulse from fingertip color changes.
 * Pure client-side Canvas API processing — no data leaves the device.
 */
export class HeartRateMonitor {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private callback: HeartRateCallback | null = null;

  // Signal buffer
  private redValues: number[] = [];
  private timestamps: number[] = [];
  private readonly BUFFER_SECONDS = 10;
  private readonly SAMPLE_RATE = 30; // approx fps
  private readonly BUFFER_SIZE = this.BUFFER_SECONDS * this.SAMPLE_RATE;

  // BPM calculation
  private _bpm: number | null = null;
  private smoothedBpm: number | null = null;
  private readonly BPM_SMOOTHING = 0.3;

  // Warmup
  private startTime = 0;
  private readonly WARMUP_MS = 5000;

  // Coherence
  private bpmHistory: number[] = [];
  private currentBreathingPhase: string = "idle";

  get bpm() { return this.smoothedBpm; }
  get isReady() { return Date.now() - this.startTime > this.WARMUP_MS && this.smoothedBpm !== null; }

  onUpdate(callback: HeartRateCallback) {
    this.callback = callback;
  }

  setBreathingPhase(phase: string) {
    this.currentBreathingPhase = phase;
  }

  async start(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<boolean> {
    try {
      this.video = videoElement;
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext("2d", { willReadFrequently: true });
      if (!this.ctx) return false;

      // Request rear camera
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 64 },
          height: { ideal: 64 },
        },
      });

      this.video.srcObject = this.stream;
      await this.video.play();

      // Try to enable torch
      const track = this.stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: true } as any],
        });
      } catch {
        // Torch not available on all devices — continue without it
      }

      this.canvas.width = 64;
      this.canvas.height = 64;
      this.startTime = Date.now();
      this.redValues = [];
      this.timestamps = [];
      this.smoothedBpm = null;
      this.bpmHistory = [];

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
      const track = this.stream.getVideoTracks()[0];
      // Turn off torch
      try {
        track.applyConstraints({ advanced: [{ torch: false } as any] }).catch(() => {});
      } catch {}
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }

    this._bpm = null;
    this.smoothedBpm = null;
    this.redValues = [];
    this.timestamps = [];
    this.bpmHistory = [];
  }

  private loop = () => {
    if (!this.video || !this.ctx || !this.canvas) return;

    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // Calculate average red channel
    let redSum = 0;
    let pixelCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i]; // Red channel
      pixelCount++;
    }
    const avgRed = redSum / pixelCount;

    const now = Date.now();
    this.redValues.push(avgRed);
    this.timestamps.push(now);

    // Keep buffer size
    while (this.redValues.length > this.BUFFER_SIZE) {
      this.redValues.shift();
      this.timestamps.shift();
    }

    // Calculate BPM after warmup
    if (now - this.startTime > this.WARMUP_MS && this.redValues.length > this.SAMPLE_RATE * 3) {
      this.calculateBPM();
    }

    // Signal quality based on red channel amplitude variance
    const signalQuality = this.calculateSignalQuality();

    // Coherence
    const coherence = this.calculateCoherence();

    this.callback?.({
      bpm: this.smoothedBpm,
      signalQuality,
      coherence,
      isReady: this.isReady,
    });

    this.rafId = requestAnimationFrame(this.loop);
  };

  private calculateBPM() {
    if (this.redValues.length < 60) return;

    // Apply simple bandpass: subtract moving average (high-pass)
    const windowSize = 15;
    const filtered: number[] = [];
    for (let i = windowSize; i < this.redValues.length; i++) {
      const avg = this.redValues.slice(i - windowSize, i).reduce((a, b) => a + b, 0) / windowSize;
      filtered.push(this.redValues[i] - avg);
    }

    // Peak detection using zero-crossings of derivative
    const peaks: number[] = [];
    for (let i = 2; i < filtered.length - 2; i++) {
      if (
        filtered[i] > filtered[i - 1] &&
        filtered[i] > filtered[i - 2] &&
        filtered[i] > filtered[i + 1] &&
        filtered[i] > filtered[i + 2] &&
        filtered[i] > 0
      ) {
        // Check minimum distance between peaks (> 300ms = < 200 BPM)
        if (peaks.length === 0 || (i - peaks[peaks.length - 1]) > 9) {
          peaks.push(i);
        }
      }
    }

    if (peaks.length < 3) return;

    // Calculate BPM from inter-peak intervals
    const intervals: number[] = [];
    const adjustedTimestamps = this.timestamps.slice(windowSize);
    for (let i = 1; i < peaks.length; i++) {
      const dt = (adjustedTimestamps[peaks[i]] - adjustedTimestamps[peaks[i - 1]]) / 1000;
      if (dt > 0.3 && dt < 2.0) { // 30-200 BPM range
        intervals.push(dt);
      }
    }

    if (intervals.length < 2) return;

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const rawBpm = Math.round(60 / avgInterval);

    // Sanity check
    if (rawBpm < 40 || rawBpm > 180) return;

    this._bpm = rawBpm;

    // Exponential moving average smoothing
    if (this.smoothedBpm === null) {
      this.smoothedBpm = rawBpm;
    } else {
      this.smoothedBpm = Math.round(
        this.smoothedBpm * (1 - this.BPM_SMOOTHING) + rawBpm * this.BPM_SMOOTHING
      );
    }

    // Track BPM history for HRV / coherence
    this.bpmHistory.push(this.smoothedBpm);
    if (this.bpmHistory.length > 60) this.bpmHistory.shift();
  }

  private calculateSignalQuality(): number {
    if (this.redValues.length < 30) return 0;

    const recent = this.redValues.slice(-30);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, v) => sum + (v - mean) ** 2, 0) / recent.length;
    const std = Math.sqrt(variance);

    // Good signal: mean red channel > 100 (finger covering), some variance (pulsation)
    const coverageScore = Math.min(1, mean / 150); // Is finger over camera?
    const pulsationScore = Math.min(1, std / 3);     // Is there pulsation?

    // Too much variance = noise
    const noiseScore = std > 20 ? Math.max(0, 1 - (std - 20) / 30) : 1;

    return Math.round(coverageScore * pulsationScore * noiseScore * 100);
  }

  private calculateCoherence(): number {
    if (this.bpmHistory.length < 10) return 0;

    // HRV coherence: look for regular oscillation in BPM
    // High coherence = sinusoidal pattern in HR aligned with breathing
    const recent = this.bpmHistory.slice(-20);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const deviations = recent.map(v => v - mean);

    // Check for regularity: count sign changes (oscillation)
    let signChanges = 0;
    for (let i = 1; i < deviations.length; i++) {
      if (deviations[i] * deviations[i - 1] < 0) signChanges++;
    }

    // Ideal: ~4-6 sign changes in 20 samples (respiratory sinus arrhythmia)
    const oscillationScore = signChanges >= 3 && signChanges <= 10
      ? 1 - Math.abs(signChanges - 6) / 6
      : 0.2;

    // Amplitude of oscillation (should be moderate, not flat)
    const maxDev = Math.max(...deviations.map(Math.abs));
    const amplitudeScore = maxDev > 1 && maxDev < 15 ? 1 - Math.abs(maxDev - 5) / 15 : 0.2;

    return Math.round(Math.max(0, Math.min(100, oscillationScore * amplitudeScore * 100)));
  }
}
