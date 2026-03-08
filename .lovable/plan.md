

# Breathe Tab (Session Page) — Real User Audit Report

## Testing Scope
Complete walkthrough of the Session page across all states: idle (pre-session setup), running (active breathing), paused, done (post-session summary), playlist-transition, and mini-player. Reviewed all sub-components (BreathingVisualizer, BreathingCircle, ParticleBackground, ScreenColorBreathing, BreathingFeedback, HeartRateMonitor, MoodPicker, SoundscapePicker) and supporting libraries (techniques.ts, progression.ts, coherence.ts, voice.ts, haptics.ts, xp.ts, breathDetector.ts, shareCard.ts, soundscapes.ts).

---

## Issues Found

### BUG 1 — CRITICAL: `finishSession` captures stale `totalElapsed` via closure

**File**: `src/pages/Session.tsx` lines 220-301

`finishSession` is wrapped in `useCallback` with `totalElapsed` in its dependency array. But `stop()` calls `finishSession()`, and `stop` itself is in `tick`'s dependency chain. The `tick` function updates `totalElapsed` via `setTotalElapsed`, but also calls `stop()` inside that same setter callback (line 386). At that moment, `finishSession` still holds the previous render's `totalElapsed` value. This means: if the timer auto-completes (reaches `durationMin * 60`), the session is saved with `totalElapsed` being **1 second less** than the actual duration. For short 2-minute sessions, the done screen may show "1 min" instead of "2 min."

**Fix**: Use `elapsedRef.current` (which exists at line 576) inside `finishSession` instead of the state variable, or move the check outside the setter.

---

### BUG 2 — HIGH: Badge unlock toasts show hardcoded English

**File**: `src/pages/Session.tsx` line 292

```
toast(`${badge.emoji} ${badge.name} unlocked!`, { description: badge.description });
```

Both `badge.name` ("First Breath", "Week Warrior") and `badge.description` ("Complete your first session") are hardcoded English strings in `achievements.ts`. The word "unlocked!" is also hardcoded. Bengali users see English toast notifications during their session completion.

**Fix**: Use locale keys for badge names/descriptions and the "unlocked" word.

---

### BUG 3 — HIGH: XP title names are hardcoded English

**File**: `src/lib/xp.ts` lines 18-29

The `LEVELS` array contains titles like "Beginner Breather", "Mindful Starter", "Zen Sage" etc. These are shown on the done screen via `XPEarnedDisplay` (line 70: `newTitle`). No locale key lookup. Bengali users see English XP titles.

**Fix**: Change titles to locale keys and resolve at display time.

---

### BUG 4 — HIGH: `"Lv."` prefix hardcoded English on Session page (2 locations)

**File**: `src/pages/Session.tsx` lines 676, 795

Both the done screen and the active session header show `Lv.{progression.level}`. This was already identified and fixed in TechniqueCard during the previous audit, but the Session page was missed.

**Fix**: Use the locale key `t("common.level", { level: progression.level })` as done in TechniqueCard.

---

### BUG 5 — MEDIUM: Voice toggle button aria-label is identical for both states

**File**: `src/pages/Session.tsx` line 947

```
aria-label={voiceOn ? t("settings.voiceEnable") : t("settings.voiceEnable")}
```

Both branches use the same label. Screen readers cannot distinguish between "mute" and "unmute" states. The ternary is meaningless.

**Fix**: Use distinct labels like `t("session.voiceMute")` and `t("session.voiceUnmute")`.

---

### BUG 6 — MEDIUM: Progression level shown on done screen uses stale pre-session data

**File**: `src/pages/Session.tsx` line 676

`progression` is computed at line 102: `const progression = getProgression(techniqueId)` — this runs at component mount. By the done screen, `finishSession` has already called `updateProgression()` which incremented the session count and possibly leveled up. But `progression` is never re-fetched. So the level badge on the done screen shows the **old** level, even though `levelUpInfo` correctly shows the new level.

If a user just leveled up from Lv.2 to Lv.3, they see both "Lv.2 Novice" (stale) and the "Level Up! → Skilled" banner (correct). This is contradictory.

**Fix**: Re-read progression after `updateProgression()` in `finishSession`, or compute the displayed level from `levelUpInfo` when available.

---

### BUG 7 — MEDIUM: `getProgression()` and `getCustomTechniques()` called on every render without memoization

**File**: `src/pages/Session.tsx` lines 94, 102-103

- Line 94: `getCustomTechniques()` called inside the render body (not memoized)
- Line 102: `getProgression(techniqueId)` called in render body (parses localStorage)
- Line 103: `getScaledPhases()` depends on `progression` which is a new object each render

These cause unnecessary localStorage reads on each re-render. During an active session (re-rendering every second from the timer), that's 2-3 localStorage parses per second.

**Fix**: Wrap in `useMemo` with appropriate dependencies.

---

### BUG 8 — MEDIUM: Session saved with `technique.name` (English) not translated name

**File**: `src/pages/Session.tsx` line 269

```
techniqueName: technique.name,
```

The session record stores the raw English `technique.name` (e.g., "Box Breathing") rather than the translated name or the technique ID. When Bengali users view their session history, technique names appear in English. The translated `techniqueName` variable exists (line 96-100) but isn't used here.

Counterpoint: Storing the ID and resolving at display time would be more correct, but since `techniqueId` is also stored (line 267), this is mainly a data quality issue.

**Fix**: Store only the ID and resolve the display name from locale at read time, or store the translated name.

---

### BUG 9 — MEDIUM: `calculateSessionXP` calls `getCurrentStreak()` internally (extra localStorage parse)

**File**: `src/lib/xp.ts` line 90

`calculateSessionXP()` calls `getCurrentStreak()` which calls `getSessions()` internally. This is yet another full localStorage parse happening inside `finishSession`. The sessions are already loaded in `finishSession` for other purposes. No way to pass them in.

**Fix**: Accept an optional `streak` parameter in `calculateSessionXP` to avoid the extra parse.

---

### BUG 10 — LOW: Particle canvas doesn't re-read theme colors after theme switch

**File**: `src/components/ParticleBackground.tsx` lines 68-71

`getComputedHSL()` is called once inside the `useEffect` with `[]` dependency. If a user changes theme mid-session (via Settings), the particle colors remain the old theme's colors until the component is remounted.

**Fix**: Re-read colors on theme change, or accept this as an edge case.

---

### BUG 11 — LOW: Done screen "Again" button resets state but doesn't reset `sessionIdRef`

**File**: `src/pages/Session.tsx` lines 736-738

The "Again" button resets visual state but `sessionIdRef.current` is only regenerated in `start()`. Between pressing "Again" and "Start", if any code references the session ID, it's the old completed session's ID. Not a functional bug currently, but fragile.

**Fix**: Reset `sessionIdRef.current` in the "Again" handler or accept that `start()` handles it.

---

### BUG 12 — LOW: `durationMin` cannot be set to a custom value beyond the 5 presets

**File**: `src/pages/Session.tsx` lines 842-855

Only 5 fixed duration buttons: 2, 3, 5, 10, 15 minutes. A user who wants a 7-minute or 20-minute session has no option. Programs can pass a custom duration via URL param, but manual session setup is limited to these 5 values.

**Fix**: Add a small input or a "+" button for custom duration entry.

---

## Summary Table

| # | Severity | Issue | User Impact |
|---|----------|-------|-------------|
| 1 | CRITICAL | `finishSession` captures stale `totalElapsed` on auto-complete | Wrong duration saved/displayed |
| 2 | HIGH | Badge toasts hardcoded English | Bengali users see English toasts |
| 3 | HIGH | XP titles hardcoded English | Bengali users see English XP titles |
| 4 | HIGH | "Lv." prefix hardcoded on Session page | Mixed language text |
| 5 | MEDIUM | Voice toggle aria-label identical both states | Accessibility broken |
| 6 | MEDIUM | Done screen shows stale pre-session level | Contradicts level-up banner |
| 7 | MEDIUM | `getProgression`/`getCustomTechniques` not memoized | 2-3 localStorage parses/sec |
| 8 | MEDIUM | Session saved with English technique name | English names in Bengali history |
| 9 | MEDIUM | `calculateSessionXP` re-parses storage for streak | Redundant localStorage access |
| 10 | LOW | Particle colors don't update on theme change | Visual inconsistency |
| 11 | LOW | "Again" doesn't reset sessionIdRef | Fragile but harmless |
| 12 | LOW | Only 5 fixed duration options | No custom duration input |

---

## Recommendation

**Priority 1** — Fix #1 (stale `totalElapsed` closure): This is a data correctness bug that silently saves wrong durations. Use `elapsedRef.current` instead.

**Priority 2** — Fix #2, #3, #4 (i18n): The badge toasts, XP titles, and "Lv." prefix are the most visible English-in-Bengali issues on the session flow.

**Priority 3** — Fix #5, #6, #7 (UX/perf): The voice a11y label, stale level display, and per-second localStorage parsing are quality issues worth addressing.

**Priority 4** — Fix #8, #9, #10, #11, #12 (polish): Data quality, minor performance, and feature gaps.

