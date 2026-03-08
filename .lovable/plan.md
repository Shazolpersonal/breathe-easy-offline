

# Muhurto Breath — Quality Audit Report

## Executive Summary

The app is a well-structured, offline-first PWA for guided breathing exercises built with React, TypeScript, and Tailwind CSS. After reviewing all pages, components, contexts, hooks, and utility libraries, I identified **14 issues** across 4 severity levels. The codebase is generally clean with good patterns, but there are bugs, dead code, and areas needing improvement.

---

## Severity Levels

- **CRITICAL** — Causes broken functionality or data loss
- **HIGH** — Significant UX issue or potential runtime error
- **MEDIUM** — Code quality, minor UX, or maintainability concern
- **LOW** — Polish, best practices, minor improvements

---

## Issues Found

### CRITICAL

**1. Mini-Player timer does not tick when away from Session page**
- **File**: `src/contexts/SessionContext.tsx`, `src/pages/Session.tsx`
- **Problem**: When navigating away from `/session`, the Session component unmounts and saves state to `SessionContext`. However, the `SessionContext` has no timer interval — it only stores a static `elapsed` value. The mini-player shows a frozen timer that never advances. Returning to `/session` also doesn't restore the running session (line 517-519 just calls `stopMiniSession()`).
- **Impact**: Users see a stale timer in the mini-player; the feature is non-functional beyond display.

**2. Friend Challenge `getActiveChallenges()` only matches today's date**
- **File**: `src/lib/friendChallenge.ts` line 93-94
- **Problem**: `getActiveChallenges()` filters by `c.date === today`, where `c.date` is the **creation** date set by the challenger. If a friend receives the challenge a day later, it will never appear as active.
- **Impact**: Friend challenges are effectively one-day-only and will silently disappear if not opened same day.

### HIGH

**3. `Index.tsx` page is dead code / unreachable**
- **File**: `src/pages/Index.tsx`
- **Problem**: The route `/` maps to `Home`, and no route maps to `Index`. This file is never rendered — it's leftover boilerplate ("Welcome to Your Blank App").
- **Fix**: Delete the file.

**4. Consistency score uses hardcoded 300s (5 min) target instead of user's setting**
- **File**: `src/lib/consistency.ts` line 41
- **Problem**: `const targetSeconds = 300` ignores `settings.defaultDurationMinutes`. A user with a 10-minute default will show inflated completion scores.
- **Fix**: Accept the user's default duration as a parameter, or read from storage.

**5. Session `moodAfter` not saved to session record**
- **File**: `src/pages/Session.tsx` line 261-274
- **Problem**: When `addSession()` is called in `finishSession()`, the `moodAfter` field is omitted (only `moodBefore` is included). The mood is saved separately via `saveMoodRecord()`, but `SessionRecord.moodAfter` in storage is always `undefined`. The CSV export and other features that read `s.moodAfter` will always show empty.
- **Impact**: CSV export "Mood After" column is always blank.

**6. Insights use pipe-delimited strings instead of structured data**
- **File**: `src/lib/insights.ts`, `src/components/stats/InsightsTab.tsx`
- **Problem**: Insights are returned as `"insight.bestTime|7am"` strings and parsed with `split("|")`. If a technique name contains `|`, parsing breaks. This is fragile.
- **Impact**: Low probability but architecturally fragile.

### MEDIUM

**7. `useKeyboardShortcuts` re-creates handler on every render**
- **File**: `src/hooks/useKeyboardShortcuts.ts` line 22
- **Problem**: The `useCallback` depends on `[callbacks]`, and `callbacks` is a new object literal every render in both `App.tsx` and `Session.tsx`. This causes the event listener to be removed and re-added on every render.
- **Fix**: Memoize the callbacks object or use refs internally.

**8. Calendar heatmap: "today" check may fail across timezones**
- **File**: `src/components/stats/MoodHeatmapCalendar.tsx` line 92-93
- **Problem**: `cell.dateKey` is constructed as `YYYY-MM-DD` from local year/month/day, but compared against `new Date().toISOString().split("T")[0]` which is UTC. In UTC+X timezones after midnight local time, these won't match.
- **Fix**: Use local date formatting for comparison.

**9. `getAdaptiveSuggestionForMood()` returns hardcoded English**
- **File**: `src/lib/mood.ts` line 111
- **Problem**: `"When you're ${moodLabel}, ${technique.name} helped you most."` is not localized. Bengali users see English text.
- **Fix**: Return IDs/data and let the component build the localized string.

**10. No error boundary**
- **Problem**: No React error boundary exists. If any component throws (e.g., corrupted localStorage JSON), the entire app crashes to a white screen.
- **Fix**: Add a top-level `ErrorBoundary` component.

**11. Session page is 890 lines — too large**
- **File**: `src/pages/Session.tsx`
- **Problem**: The file handles idle state, running state, done state, playlist transitions, zen mode, breath detection, heart rate, soundscapes, keyboard shortcuts, and mini-player sync. This makes it hard to maintain and debug.
- **Fix**: Extract sub-components and custom hooks (e.g., `useSessionTimer`, `useBreathDetection`).

### LOW

**12. Unused import: `parseChallengeFromURL` in `FriendChallenge.tsx`**
- **File**: `src/components/FriendChallenge.tsx` line 14
- **Problem**: `parseChallengeFromURL` is imported but never used in this file (it's used in `App.tsx`).

**13. No `<meta name="viewport">` confirmation**
- **File**: `index.html` (not viewed but should be verified)
- **Problem**: PWA apps need proper viewport meta for mobile. Should verify it exists.

**14. `document.execCommand("copy")` fallback is deprecated**
- **File**: `src/components/FriendChallenge.tsx` line 62
- **Problem**: `document.execCommand("copy")` is deprecated. Modern browsers may remove it.
- **Impact**: Minimal — it's a fallback only used when `navigator.clipboard` is unavailable.

---

## Summary Table

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | CRITICAL | Mini-player timer frozen / session not restored | SessionContext + Session.tsx |
| 2 | CRITICAL | Friend challenges expire after 1 day | friendChallenge.ts |
| 3 | HIGH | Dead `Index.tsx` file | Index.tsx |
| 4 | HIGH | Hardcoded 5-min target in consistency score | consistency.ts |
| 5 | HIGH | `moodAfter` never saved to session record | Session.tsx |
| 6 | HIGH | Pipe-delimited insight strings are fragile | insights.ts |
| 7 | MEDIUM | Keyboard shortcut listener re-created every render | useKeyboardShortcuts.ts |
| 8 | MEDIUM | Timezone mismatch in calendar "today" highlight | MoodHeatmapCalendar.tsx |
| 9 | MEDIUM | Hardcoded English in mood suggestion | mood.ts |
| 10 | MEDIUM | No error boundary | App.tsx |
| 11 | MEDIUM | Session.tsx is 890 lines | Session.tsx |
| 12 | LOW | Unused import | FriendChallenge.tsx |
| 13 | LOW | Verify viewport meta | index.html |
| 14 | LOW | Deprecated execCommand fallback | FriendChallenge.tsx |

---

## Recommendation

Fix issues **#1, #2, and #5 first** — these are functional bugs that affect core features. Issues #3-4 are quick wins. The remaining items improve code quality and robustness.

Shall I proceed to fix these issues?

