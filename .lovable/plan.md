

# Visual & Sensory — Particles, Color Breathing, Multiple Visualizations

## Overview

Three visual enhancements for the session screen. All pure CSS/Canvas, no libraries.

---

## 1. Particle Animation Background

**`src/components/ParticleBackground.tsx`** (new)

A Canvas-based component rendered behind the breathing circle during active sessions.

- ~60 particles floating gently in idle/hold states
- **Inhale**: particles drift inward toward center, cluster tighter
- **Exhale**: particles scatter outward, spread apart
- **Hold**: particles orbit slowly in place
- Colors derived from CSS variables (`--breathe-glow`, `--breathe-glow-secondary`)
- Uses `requestAnimationFrame` loop, cleans up on unmount
- Props: `phase`, `phaseDuration` — same as BreathingCircle

**Integration**: Render as an absolute-positioned layer in `Session.tsx` behind the breathing visualization.

---

## 2. Screen Color Breathing

**`src/components/ScreenColorBreathing.tsx`** (new)

A full-screen gradient overlay that shifts with breathing phases.

- **Inhale**: warm tint — subtle amber/warm glow fades in
- **Exhale**: cool tint — blue/teal wash
- **Hold**: stable at current color
- Implemented as a `div` with CSS transitions on `background` matching `phaseDuration`
- Very low opacity (~0.08-0.12) so it tints without obscuring UI
- Props: `phase`, `phaseDuration`

**Integration**: Absolute-positioned behind everything in Session page. Can be toggled on/off.

---

## 3. Multiple Circle Visualizations

**Visualization modes** (user selects in Settings or session idle screen):

1. **Circle** (current default) — existing `BreathingCircle`
2. **Wave** — CSS/Canvas sine wave that rises on inhale, falls on exhale
3. **Bars** — 5-7 vertical bars that rise/fall in a staggered pattern
4. **Mandala** — SVG/Canvas rotating geometric pattern, speed changes with phase

**`src/components/visualizations/WaveVisualization.tsx`** (new) — Canvas sine wave
**`src/components/visualizations/BarsVisualization.tsx`** (new) — CSS animated bars
**`src/components/visualizations/MandalaVisualization.tsx`** (new) — SVG rotating mandala

**`src/components/BreathingVisualizer.tsx`** (new) — Wrapper that renders the selected visualization based on a `visualizationType` setting. Same props interface as BreathingCircle.

**Settings**: Add `visualizationType: "circle" | "wave" | "bars" | "mandala"` to `AppSettings` in storage. Add picker in Settings page and also as small icon buttons on the session idle screen.

---

## File Changes

| File | Action |
|---|---|
| `src/components/ParticleBackground.tsx` | New — Canvas particle system |
| `src/components/ScreenColorBreathing.tsx` | New — phase-reactive color overlay |
| `src/components/visualizations/WaveVisualization.tsx` | New — sine wave canvas |
| `src/components/visualizations/BarsVisualization.tsx` | New — vertical bars CSS |
| `src/components/visualizations/MandalaVisualization.tsx` | New — rotating SVG mandala |
| `src/components/BreathingVisualizer.tsx` | New — visualization switcher |
| `src/components/BreathingCircle.tsx` | Keep as-is (used as "circle" mode) |
| `src/lib/storage.ts` | Add `visualizationType` to `AppSettings` |
| `src/pages/Session.tsx` | Add ParticleBackground, ScreenColorBreathing, replace BreathingCircle with BreathingVisualizer, add viz picker in idle state |
| `src/pages/Settings.tsx` | Add visualization type selector |

