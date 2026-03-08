

# Ambient Soundscape — Real User Testing Report

## How I Tested

I traced every user path through the soundscape feature: selecting a soundscape before/during a session, pausing/resuming, changing soundscapes mid-session, adjusting volume, using keyboard shortcuts, navigating away (mini-player), stopping, and configuring defaults in Settings.

---

## Issues Found

### BUG 1 — CRITICAL: Changing soundscape mid-session does nothing to audio

**Where**: Session page, soundscape picker (Rain → Ocean → Wind) while session is running
**File**: `src/pages/Session.tsx` line 866

The picker calls `setSoundscapeType(type)` which only updates React state. It never calls `soundscapeEngineRef.current.stop()` or `.start(newType)`. The UI shows the new selection highlighted, but the old sound keeps playing. The user thinks they switched to Ocean but Rain is still audible.

**Expected**: Tapping a different soundscape should stop the current one and start the new one immediately.

---

### BUG 2 — HIGH: Soundscape keeps playing when session is paused

**Where**: Session page, tap Pause button
**File**: `src/pages/Session.tsx` lines 418-422

`pause()` calls `stopSpeaking()` for voice but does nothing to the soundscape engine. The ambient sound continues at full volume during pause. This is jarring — the breathing circle stops, voice stops, but rain/ocean/wind keeps going as if nothing happened.

`resume()` (lines 424-428) also has no soundscape handling, so if we fix pause to mute, we need resume to unmute.

**Expected**: Soundscape should mute or significantly lower volume on pause, and restore on resume.

---

### BUG 3 — MEDIUM: Keyboard shortcut 'S' can only turn soundscape OFF, never back ON

**Where**: Press 'S' during session
**File**: `src/pages/Session.tsx` lines 515-520

The handler only handles the `soundscapeType !== "off"` case. Once you press S to mute, there's no keyboard way to restore it. The shortcut help dialog says "Toggle soundscape" but it's actually "Kill soundscape."

**Expected**: S should toggle between the last-used soundscape and off.

---

### BUG 4 — MEDIUM: No volume control during session

**Where**: Session page while running
**File**: `src/pages/Session.tsx` lines 863-868

The session page shows the soundscape picker (Rain/Ocean/Wind/Off) but no volume slider. The only volume control is in Settings. A user who finds the rain too loud mid-session must navigate to Settings (which triggers mini-player, stops audio), change volume, then return. This breaks flow.

**Expected**: A compact volume slider near the soundscape picker during sessions.

---

### BUG 5 — LOW: Settings soundscape picker gives no audio preview

**Where**: Settings page, Ambient Soundscape section
**File**: `src/pages/Settings.tsx` lines 160-163

Tapping Rain/Ocean/Wind in Settings only saves the preference via `update({ soundscapeType: type })`. No audio plays. The user has no way to hear what "Ocean" sounds like before starting a session. The volume slider also adjusts silently.

**Expected**: Briefly play a 3-5 second preview when a soundscape is selected in Settings.

---

### BUG 6 — LOW: `timeoutIds` array grows unbounded during long sessions

**Where**: `src/lib/soundscapes.ts` line 95
**File**: `SoundscapeEngine.scheduleTimeout()`

Every scheduled timeout pushes to `this.timeoutIds` but fired IDs are never removed. Over a 30-minute Rain session, this array accumulates ~900 entries (one every 2 seconds). Not a memory leak per se (the IDs are just numbers), but it means `stop()` iterates over hundreds of already-fired IDs calling `clearTimeout` on them unnecessarily.

**Expected**: Clean up fired IDs, or at minimum, cap the array.

---

## Summary

| # | Severity | Issue | User Impact |
|---|----------|-------|-------------|
| 1 | CRITICAL | Switching soundscape mid-session doesn't change audio | User hears wrong sound |
| 2 | HIGH | Soundscape plays through pause | Breaks pause UX |
| 3 | MEDIUM | 'S' shortcut is one-way (off only) | Can't restore sound via keyboard |
| 4 | MEDIUM | No volume slider during session | Must leave session to adjust |
| 5 | LOW | No audio preview in Settings | User picks blindly |
| 6 | LOW | Timeout ID array grows unbounded | Minor inefficiency |

## Recommendation

Fix #1 and #2 first — they are the most disruptive to the core session experience. #3 and #4 are quick UX wins. #5 is a nice-to-have polish.

