

# Intelligence & Personalization — 3 Features

## Feature 1: Auto-Adaptive Sessions

**What it does**: Analyzes past session history (time-of-day, mood patterns, completion rates, calm scores) to automatically recommend the optimal technique and duration. Replaces the simple time-based suggestions with data-driven intelligence.

**New file**: `src/lib/adaptive.ts`
- `getAdaptiveSession()` → returns `{ techniqueId, durationMinutes, reason }` 
- Analyzes `SessionRecord[]` from localStorage:
  - **Time-of-day bucketing**: Groups sessions by hour (morning/afternoon/evening/night), finds which technique yields the highest calm score per time bucket
  - **Mood-based**: If mood is provided, uses existing `getBestTechniqueForMood()` as a signal
  - **Completion rate**: Filters out techniques where the user frequently stops early (duration < 50% target), favoring techniques they finish
  - **Optimal duration**: Calculates average completed duration per technique per time bucket, rounds to nearest minute
  - Falls back to existing `getSmartSuggestion()` when insufficient data (<5 sessions)

**UI changes**:
- `SmartSuggestion.tsx`: When `getAdaptiveSession()` returns data, show an "Auto Session" button that navigates with the recommended technique + duration pre-set. Show the reason (e.g., "Box Breathing works best for you in the evening"). Keep existing mood picker and fallback.
- `Home.tsx`: Add a prominent "Start Smart Session" card when adaptive data is available
- Add ~10 translation keys to `en.ts` and `bn.ts`

---

## Feature 2: Breathing Pattern Detection (Microphone)

**What it does**: Uses Web Audio API to listen to breathing sounds via microphone during a session. Detects inhale/exhale rhythm and shows real-time accuracy feedback. All processing is local — no data leaves the device.

**New file**: `src/lib/breathDetector.ts`
- `BreathDetector` class:
  - `start()`: Requests mic permission, creates `AudioContext` + `AnalyserNode`
  - Uses `getByteFrequencyData()` in a `requestAnimationFrame` loop
  - Calculates RMS volume level from frequency bins
  - Detects breathing state: volume above threshold = inhale/exhale, below = hold
  - Tracks transitions (quiet→loud = inhale start, loud→quiet = exhale end)
  - Exposes: `currentVolume` (0-1), `isBreathing` (boolean), `rhythmAccuracy` (0-100 comparing detected timing vs expected phase timing)
  - `stop()`: Closes AudioContext, releases mic
  - `onRhythmUpdate(callback)`: Fires with `{ accuracy, phase, volume }`

**New component**: `src/components/BreathingFeedback.tsx`
- Small overlay during session showing:
  - Volume meter (simple bar showing mic input level)
  - Rhythm accuracy percentage
  - Color indicator: green (good sync), yellow (slightly off), red (out of sync)
- Only visible when breath detection is active

**Session integration** (`Session.tsx`):
- Add a mic toggle button (icon) next to the voice toggle in the controls area
- When enabled, instantiate `BreathDetector`, pass current phase info
- Show `BreathingFeedback` component overlay
- On session end, include average rhythm accuracy in the done screen
- Store `breathAccuracy` in `SessionRecord` for stats

**Settings** (`Settings.tsx`):
- Add "Breathing Detection" toggle in a new section with description about mic usage and privacy
- Add `breathDetectionEnabled` to `AppSettings`

**Translation keys**: ~15 keys for mic permissions, accuracy labels, feedback messages

---

## Feature 3: Heart Rate Estimation via Camera (PPG)

**What it does**: Uses the rear camera + flashlight (torch) to detect pulse from fingertip color changes. Shows BPM and heart rate coherence with breathing rhythm. Pure client-side Canvas API processing.

**New file**: `src/lib/heartRate.ts`
- `HeartRateMonitor` class:
  - `start()`: Opens rear camera with `{ facingMode: "environment" }` and enables torch via `track.applyConstraints({ advanced: [{ torch: true }] })`
  - Renders video to a hidden `<canvas>`, samples the red channel average every frame
  - Maintains a rolling buffer (~10 seconds of red channel values at 30fps)
  - **Peak detection**: Finds periodic peaks in the red signal using a simple moving-average crossover algorithm
  - Calculates BPM from inter-peak intervals
  - Applies smoothing (exponential moving average) to reduce noise
  - `getBPM()`: Returns current estimated BPM (or null if not enough data)
  - `getCoherence(currentPhase)`: Compares heart rate variability pattern with breathing phase — returns 0-100 coherence score
  - `stop()`: Stops camera stream, releases resources
  - Signal quality indicator based on red channel amplitude variance

**New component**: `src/components/HeartRateMonitor.tsx`
- Full-screen overlay / modal triggered from session screen
- Shows: hidden video element, BPM display with pulsing animation, coherence score, signal quality bar
- Instructions: "Place your fingertip over the rear camera"
- Warmup period (~5 seconds) before showing BPM
- Dismiss/close button

**New page/route**: Not needed — accessible from Session screen as an optional overlay

**Session integration** (`Session.tsx`):
- Add a heart icon button next to mic/voice toggles
- When tapped, opens `HeartRateMonitor` as a modal overlay
- Can run alongside the breathing session
- On session end, if heart rate data was captured, show average BPM and coherence in done screen
- Store `avgHeartRate` and `heartCoherence` in `SessionRecord`

**Settings**: Add `heartRateEnabled` toggle with privacy description

**Translation keys**: ~15 keys for heart rate labels, instructions, coherence levels

---

## File Change Summary

| File | Action |
|---|---|
| `src/lib/adaptive.ts` | New — adaptive session engine |
| `src/lib/breathDetector.ts` | New — mic-based breath detection |
| `src/lib/heartRate.ts` | New — camera-based PPG heart rate |
| `src/components/BreathingFeedback.tsx` | New — breath detection overlay |
| `src/components/HeartRateMonitor.tsx` | New — heart rate modal |
| `src/components/SmartSuggestion.tsx` | Update — use adaptive engine |
| `src/pages/Home.tsx` | Update — smart session card |
| `src/pages/Session.tsx` | Update — mic + heart rate toggles, done screen data |
| `src/pages/Settings.tsx` | Update — breath detection + heart rate toggles |
| `src/lib/storage.ts` | Update — new fields in SessionRecord + AppSettings |
| `src/locales/en.ts` | Update — ~40 new keys |
| `src/locales/bn.ts` | Update — ~40 new keys |

## Execution Order

1. Auto-Adaptive Sessions (safest, no device APIs)
2. Breathing Pattern Detection (microphone)
3. Heart Rate Estimation (camera + torch)

Each feature is self-contained and won't break existing functionality.

