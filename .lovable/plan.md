

# Experience & Immersion — 3 Features

## Feature 1: Ambient Soundscapes (Web Audio API)

Procedurally generate rain, ocean, and wind sounds using `AudioContext` + white/brown noise + bandpass filters. No audio files needed.

**New file**: `src/lib/soundscapes.ts`
- `SoundscapeEngine` class with methods `start(type)`, `stop()`, `setVolume(0-1)`
- Three sound types:
  - **Rain**: White noise through a bandpass filter (1000-4000Hz) + random "drip" clicks via short gain envelopes
  - **Ocean**: Brown noise with a slow LFO on gain (simulates waves crashing and receding, ~6-8s cycle)
  - **Wind**: Pink noise through a low-pass filter with slow random cutoff modulation
- Breathing-reactive: expose `syncToPhase(phase)` — subtly modulates volume/filter in sync with breathing (louder on exhale for ocean, quieter on inhale for rain)
- Graceful start/stop with 1s fade in/out

**New component**: `src/components/SoundscapePicker.tsx`
- Small row of 4 buttons: Off, 🌧 Rain, 🌊 Ocean, 💨 Wind
- Shown in Session idle screen below visualization picker
- Also accessible in Settings

**Integration**:
- `Session.tsx`: Add soundscape picker in idle state, start/stop engine with session, sync to phase during running
- `Settings.tsx`: Add default soundscape preference + volume slider
- `AppSettings`: Add `soundscapeType: "off" | "rain" | "ocean" | "wind"` and `soundscapeVolume: number`
- ~15 translation keys

---

## Feature 2: Dark/Light Auto-Theme

Add a system-preference-aware mode + time-of-day warm tone adjustment.

**Changes to `ThemeContext.tsx`**:
- Add `themeMode: "manual" | "auto"` to `AppSettings`
- In auto mode:
  - Listen to `window.matchMedia("(prefers-color-scheme: dark)")` changes
  - When system is dark: use the user's chosen dark theme (existing themes are all dark)
  - When system is light: apply a new **light variant** CSS set
  - Time-of-day overlay: After 8pm, shift CSS variables to warmer tones (increase hue warmth by ~15deg, reduce blue channel)
- Keep manual mode as current behavior (no change)

**New CSS in `index.css`**:
- `[data-theme-mode="auto"][data-system-light="true"]` — light variants of each theme (lighter backgrounds, darker text)
- `[data-night-warmth="true"]` — subtle warm shift overlay (CSS variable overrides for warmer primary/accent)

**Settings UI**: Add a 3-option selector: Manual / Auto / Auto + Night Warmth

~10 translation keys

---

## Feature 3: Fullscreen Zen Mode

Hide all UI except the breathing visualizer using the Fullscreen API.

**Implementation**:
- Add a `Maximize` icon button in Session controls (visible when `state !== "idle"`)
- On click: `document.documentElement.requestFullscreen()` + set `zenMode = true` state
- When zen mode is active:
  - Hide: BottomNav, timer display, control buttons (except a small semi-transparent exit button in corner), playlist progress, mood picker
  - Show: Only the BreathingVisualizer + ScreenColorBreathing + ParticleBackground + phase label
  - The exit button (corner `Minimize` icon) calls `document.exitFullscreen()` + sets `zenMode = false`
- Listen to `fullscreenchange` event to sync state if user exits via Escape
- On session end: automatically exit zen mode

**Session.tsx changes**:
- Add `zenMode` state boolean
- Conditionally render/hide UI elements based on zen mode
- Add fullscreen toggle button with `Maximize2`/`Minimize2` icons

~5 translation keys

---

## File Change Summary

| File | Action |
|---|---|
| `src/lib/soundscapes.ts` | New — procedural audio engine |
| `src/components/SoundscapePicker.tsx` | New — sound type selector |
| `src/lib/storage.ts` | Add soundscape + themeMode fields to AppSettings |
| `src/contexts/ThemeContext.tsx` | Add auto-theme logic with system preference + night warmth |
| `src/index.css` | Add light theme variants + night warmth CSS |
| `src/pages/Session.tsx` | Add soundscape integration + zen mode |
| `src/pages/Settings.tsx` | Add soundscape + theme mode + zen sections |
| `src/components/BottomNav.tsx` | Hide when zen mode active (via CSS class on body) |
| `src/locales/en.ts` | ~30 new keys |
| `src/locales/bn.ts` | ~30 new keys |

## Execution Order

1. Ambient Soundscapes (self-contained audio engine)
2. Fullscreen Zen Mode (UI-only, no new APIs beyond Fullscreen)
3. Dark/Light Auto-Theme (most pervasive CSS changes, done last to avoid conflicts)

