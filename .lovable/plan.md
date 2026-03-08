

# Breathe Tab — Deep Workflow Analysis & Bug Report

## Systems Analyzed
1. **Start → Tick → Stop lifecycle** (Session.tsx core state machine)
2. **Breathing animation system** (CSS keyframes + BreathingCircle + 3 Canvas visualizers)
3. **Ambient Soundscape** (SoundscapeEngine Web Audio + session integration)
4. **Breathing logic** (phase cycling, pyramid scaling, level-based duration scaling, calm score)
5. **Mini-player** (SessionContext background timer + restore flow)

---

## Critical & High Bugs Found

### BUG 1 — CRITICAL: Breathing animation does NOT restart when same phase repeats consecutively

**Root cause**: CSS animation classes like `.breathe-inhale` use `animation: breathe-expand var(--phase-duration) forwards`. When a technique has only 2 phases (e.g., "Calm Breath" = inhale → exhale → inhale → exhale), the CSS class name stays `breathe-inhale` between consecutive inhale phases. Since the class doesn't change, **the browser does not restart the animation**. The circle simply freezes at its end state.

This affects: Calm Breath (inhale → exhale), Equal Breathing (inhale → exhale), Wim Hof (inhale → exhale).

For Box Breathing and 4-7-8, the hold phase in between means the class always changes, masking the bug.

**Fix**: Force animation restart by briefly removing the class or using a key that changes each cycle (e.g., `key={phaseIndex + completedCycles * phases.length}`).

---

### BUG 2 — CRITICAL: `tick` calls `stop()` inside `setTotalElapsed` setter — causes React state update during render

**Root cause**: Lines 393-397:
```js
setTotalElapsed((te) => {
  const newT = te + 1;
  if (newT >= durationMinRef.current * 60) stop();
  return newT;
});
```

Calling `stop()` inside a state setter callback is illegal in React. `stop()` calls `finishSession()` which calls `setState("done")`, `setMicActive(false)`, `setCalmResult(...)`, `setEarnedXP(...)`, etc. — all state updates triggered from within another `setState` callback. This can cause:
- Dropped state updates
- Stale closures
- "Cannot update a component while rendering a different component" warnings
- Race conditions with the interval still firing

**Fix**: Move the duration check out of the setter. Use a `useEffect` that watches `totalElapsed` and calls `stop()` when the threshold is reached.

---

### BUG 3 — HIGH: Soundscape continues playing if user navigates away without stopping

**Root cause**: The cleanup effect on line 494-496 calls `soundscapeEngineRef.current.stop()` on unmount. But when the user navigates away during a running session, the unmount effect on lines 604-627 fires first and calls `startMiniMode()`. The soundscape engine is a **singleton** (`getSoundscapeEngine()` returns the same instance). The cleanup effect then calls `.stop()` on unmount — killing the audio. But the mini-player has no mechanism to restart the soundscape. So:

1. User starts session with Ocean soundscape
2. User navigates to Home → mini-player appears, soundscape dies
3. User taps mini-player to return → session restores, but soundscape is silent
4. The `soundscapeType` state says "ocean" but no audio is playing

**Fix**: On restore from mini-session (lines 548-569), restart the soundscape engine if `soundscapeType !== "off"`. Currently this only happens when `!miniSession.isPaused` (line 565-567), but it should also re-read the current volume.

Actually, looking again — line 565-567 does restart the soundscape when not paused. But the issue is the **ordering**: the cleanup on line 494 runs *after* the mini-mode setup on line 604, so it kills the just-started soundscape. The order of `useEffect` cleanup is bottom-to-top when unmounting.

Wait — no. React runs cleanup effects in order of declaration. Line 494 cleanup runs before line 604 cleanup. So the flow is:
1. Line 494 cleanup: `soundscapeEngineRef.current.stop()` → kills audio
2. Line 604 cleanup: `startMiniMode(...)` → saves state including `soundscapeType: "ocean"`

So the soundscape IS killed on navigate-away. When the user returns and restores (line 565), it restarts correctly. The real bug is: **between navigate-away and return, the mini-player shows the soundscape type but no audio plays**. And if the user pauses via mini-player, then returns, the soundscape is never restarted (line 560-563 only sets state to "paused", no soundscape restart on resume).

**Fix**: Move soundscape cleanup into the mini-mode save logic — only stop if NOT entering mini mode.

---

### BUG 4 — HIGH: `tick` function recreates on every render due to unstable dependencies

**Root cause**: `tick` depends on `[currentPhases, voiceOn, settings, stop, technique, currentRound, t, language]`. 
- `stop` depends on `finishSession` which depends on `[completedCycles, technique, moodBefore, ...]`
- Every time `completedCycles` increments (every cycle), `finishSession` recreates → `stop` recreates → `tick` recreates → the `useEffect` on line 504-509 clears and recreates the interval

This means **the 1-second interval is destroyed and recreated every single breathing cycle**. The timing can drift — if a cycle completes at 500ms into a second, the new interval starts from that point, losing up to 1 second of accuracy.

**Fix**: Use refs for values that `tick` reads but shouldn't trigger recreation. The interval should be stable for the entire session.

---

### BUG 5 — HIGH: Mandala visualization `transition` and `requestAnimationFrame` fight each other

**Root cause**: MandalaVisualization applies both:
1. `style={{ transform: rotate(${rotation}deg) scale(${scale}), transition: transform ${phaseDuration}s ease-in-out }}`
2. A `requestAnimationFrame` loop that updates `rotation` via `setRotation()` every frame

The `rAF` loop updates rotation ~60 times/second, each triggering a re-render with a new `transform`. But the CSS `transition: transform ${phaseDuration}s` means the browser tries to animate each tiny change over `phaseDuration` seconds. This creates a **tug-of-war**: the rAF wants instant rotation, the CSS transition wants to smooth it. Result: janky, sluggish rotation that lags behind.

**Fix**: Separate rotation (handled by rAF, no transition) from scale (handled by CSS transition). Use two nested elements or apply rotation via a ref directly to the DOM.

---

### BUG 6 — HIGH: Mini-player auto-stop doesn't save the session

**Root cause**: SessionContext line 60: when `newElapsed >= prev.totalDuration * 60`, it returns `null` — simply killing the mini-session. No session is saved, no XP awarded, no progression updated, no badges checked. The user's entire session just vanishes.

Compare with the Session page's `stop()` → `finishSession()` which saves everything. The mini-player has no equivalent.

**Fix**: Add a callback or event mechanism so the mini-player can trigger session completion with proper saving.

---

### BUG 7 — MEDIUM: Phase timing drift from `setInterval` inaccuracy

**Root cause**: The breathing timer uses `setInterval(tick, 1000)`. JavaScript's `setInterval` is not precise — it can drift by 10-50ms per tick depending on system load. Over a 15-minute session (900 ticks), this can accumulate to 9-45 seconds of drift. The phase `secondsLeft` countdown will not match the actual wall-clock time.

Meanwhile, `phaseStartRef.current = Date.now()` records actual timestamps for calm score calculation. So the calm score may be accurate, but the displayed countdown and total elapsed time will be wrong.

**Fix**: Use `Date.now()` delta-based timing instead of counting integer seconds. Store the session start time and compute elapsed from `Date.now() - startTime`.

---

### BUG 8 — MEDIUM: `BarsVisualization` hold phase uses stale `heights[0]` from previous render

**Root cause**: Line 20: `phase === "hold" ? heights[0]` — but `heights` is the current state from the *previous* render cycle (since `useEffect` runs after render). When transitioning from inhale (90%) to hold, the first render with `phase="hold"` still has the old heights. The effect then sets `target = heights[0]` which is 90 (correct in this case). But on the *next* render, `heights[0]` is the newly set value, creating a feedback loop where hold just maintains whatever was set.

The real issue: if you go from exhale (15%) to hold-after-exhale, `heights[0]` = 15, so hold correctly stays at 15. But the bars **never animate** during hold — they just freeze. Unlike the circle which has a subtle pulse during hold, bars are completely static. This looks broken.

**Fix**: Add a subtle oscillation during hold phases, similar to the breathing circle's hold animation.

---

### BUG 9 — MEDIUM: Soundscape volume slider writes to settings on every drag frame

**Root cause**: Lines 930-933: `onValueChange` calls `update({ soundscapeVolume: v })` which writes to context and potentially localStorage on every slider drag event (~60fps). This is excessive.

**Fix**: Debounce the settings update, or only persist on `onValueCommit` (pointer release).

---

## Summary Table

| # | Severity | Issue | System |
|---|----------|-------|--------|
| 1 | CRITICAL | Animation doesn't restart for same consecutive phase | Breathing Animation |
| 2 | CRITICAL | `stop()` called inside `setState` callback | Breathing Logic |
| 3 | HIGH | Soundscape killed on navigate-away, mini-player can't restart | Ambient Soundscape |
| 4 | HIGH | Interval destroyed/recreated every cycle due to `tick` deps | Breathing Logic |
| 5 | HIGH | Mandala rAF and CSS transition fight each other | Breathing Animation |
| 6 | HIGH | Mini-player auto-stop discards entire session | Mini-player / Logic |
| 7 | MEDIUM | `setInterval` timing drift over long sessions | Breathing Logic |
| 8 | MEDIUM | Bars visualization freezes during hold phases | Breathing Animation |
| 9 | MEDIUM | Soundscape volume slider writes settings on every frame | Ambient Soundscape |

---

## Fix Plan

### Priority 1 — Critical (data loss & broken core)

**Bug 1**: Add a `key` prop to `BreathingCircle` that changes each phase transition (e.g., `key={phaseIndex + completedCycles * phases.length}`) to force React to remount and restart the CSS animation. Apply same pattern to `BreathingVisualizer`.

**Bug 2**: Remove `stop()` from inside `setTotalElapsed` callback. Add a `useEffect` that watches `totalElapsed` and triggers `stop()` when `>= durationMin * 60`.

### Priority 2 — High (session integrity & UX)

**Bug 3**: Restructure unmount cleanup — skip `soundscapeEngine.stop()` if transitioning to mini-mode. On restore from mini-session, always restart soundscape when type !== "off".

**Bug 4**: Move `completedCycles`, `voiceOn`, `settings`, `currentPhases`, `language` to refs inside `tick`. Only keep `state` as a real dependency for the interval effect.

**Bug 5**: In MandalaVisualization, split rotation and scale into two nested elements. Outer gets `transform: scale()` with CSS transition. Inner gets `transform: rotate()` without transition (direct ref manipulation).

**Bug 6**: Add an `onAutoComplete` callback prop to `SessionProvider`. When mini-player auto-stops, invoke it with the session data so the app can save it properly (or fire a custom event that Session.tsx listens for).

### Priority 3 — Medium (polish)

**Bug 7**: Replace `setInterval` + integer counter with `Date.now()`-based elapsed calculation.

**Bug 8**: Add subtle oscillation to bars during hold (±5% height over the phase duration).

**Bug 9**: Use `onValueCommit` for persisting soundscape volume to settings; keep `onValueChange` for real-time audio only.

