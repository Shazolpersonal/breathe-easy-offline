

# Muhurto Breath — Quality Audit Report (Round 2)

## Executive Summary

Following the first audit and its fixes, the app is in significantly better shape. The ErrorBoundary, structured insights, timezone fix, and challenge expiry improvements are all correctly implemented. This second-pass audit goes deeper into logic correctness, edge cases, security, performance, and UX polish. I identified **12 new issues** not covered in the previous audit.

---

## Severity Levels

- **CRITICAL** — Causes broken functionality or data loss
- **HIGH** — Significant UX issue or potential runtime error
- **MEDIUM** — Code quality, minor UX, or maintainability concern
- **LOW** — Polish, best practices, minor improvements

---

## Issues Found

### CRITICAL

**1. Mini-player session restore loses technique, phase, and timer state**
- **File**: `src/pages/Session.tsx` lines 524-536
- **Problem**: When returning to `/session` from the mini-player, only `totalElapsed` and paused/running state are restored. The `techniqueId`, `phaseIndex`, `secondsLeft`, `completedCycles`, `durationMin`, `currentRound`, `moodBefore`, soundscape, voice, and all ref-based state (phaseTimestamps, breathAccuracy, HR samples) are lost. The session effectively restarts with defaults but at the wrong elapsed time.
- **Impact**: Returning to a session from mini-player produces an inconsistent state — wrong technique may be shown, wrong phase timing, calm score will be incorrect.

**2. `dangerouslySetInnerHTML` with string replacement is an XSS vector**
- **File**: `src/pages/Stats.tsx` lines 325-347
- **Problem**: The reports tab uses `dangerouslySetInnerHTML` with `.replace()` to bold numbers. The `monthLabel` and `topTechnique.name` values are injected into HTML without sanitization. A custom technique named `<img onerror=alert(1) src=x>` would execute JavaScript.
- **Impact**: Self-XSS via custom technique names. Low real-world risk but a security anti-pattern.

### HIGH

**3. Soundscape engine uses `setTimeout` for recurring effects — leaks after `stop()`**
- **File**: `src/lib/soundscapes.ts` lines 134-152, 222-240
- **Problem**: `createRain()`, `createWind()` use recursive `setTimeout` for drip/gust scheduling. When `stop()` is called, it sets `currentType = "off"` after a 600ms delay, but the `setTimeout` callbacks check `this.currentType` before the flag is reset. Multiple rapid start/stop cycles can leak `setTimeout` chains that continue firing and creating AudioNodes after the context is closed.
- **Fix**: Track timeout IDs and clear them in `stop()`.

**4. Calm score labels are hardcoded English — not localized**
- **File**: `src/lib/coherence.ts` lines 13-18
- **Problem**: `getLabel()` returns hardcoded English strings like "Deep Calm", "Strong Coherence", "Good Rhythm", "Building Focus". These are displayed directly in the done screen's `CalmScoreDisplay` component.
- **Impact**: Bengali users see English calm score labels.

**5. `getCurrentStreak()` doesn't account for "today not started yet"**
- **File**: `src/lib/storage.ts` lines 83-97
- **Problem**: The streak algorithm starts from today and works backwards. If the user hasn't done a session today but has a streak up to yesterday, the function returns 0 because `dates[0] !== today`. The streak should count yesterday as valid (the day isn't over yet until midnight).
- **Impact**: A user with a 30-day streak sees "0" in the morning before their first session, then it jumps back to 31 after completing one.

### MEDIUM

**6. `checkAllBadges()` is called on every Stats render — performance concern**
- **File**: `src/pages/Stats.tsx` line 113
- **Problem**: `useMemo(() => checkAllBadges(), [sessions])` — `sessions` is recalculated on every render since `getSessions()` returns a new array. Additionally, every badge's `check()` function calls `getSessions()` independently (up to 15 times). For users with hundreds of sessions, this is expensive.
- **Fix**: Pass sessions as a parameter to `checkAllBadges()` and use a stable dependency.

**7. Reminder checker has 30-second precision — can miss reminders**
- **File**: `src/lib/reminders.ts` line 93
- **Problem**: The reminder checker runs every 30 seconds and compares `r.time === currentTime` using `HH:MM` format. If the check happens at 09:00:01 and the next at 09:00:31, the `09:00` minute is checked correctly. But if it fires at 08:59:45 and next at 09:00:15, it still works. However, if there's a 60-second gap (tab throttled), the minute can be entirely skipped.
- **Impact**: In background tabs, browsers throttle intervals — reminders may silently miss.

**8. Session page `tick` function has stale closure over `durationMin`**
- **File**: `src/pages/Session.tsx` line 383
- **Problem**: `stop()` is in the dependency array of `tick` via `useCallback`, and `durationMin` is captured in `tick`'s closure. If `durationMin` changes mid-session (unlikely but possible via playlist transitions), the old value could persist for one tick cycle due to React batching.
- **Impact**: Edge case only — mostly theoretical.

**9. `Home.tsx` calls multiple expensive functions on every render without memoization**
- **File**: `src/pages/Home.tsx` lines 24-26
- **Problem**: `getCurrentStreak()`, `getTodayMinutes()`, and `getCustomTechniques()` are called directly (not memoized) on every render. Each parses `localStorage` and processes all sessions. The `favTechniques` computation also runs every render.
- **Fix**: Wrap in `useMemo`.

**10. PWA manifest lacks 192x192 and 512x512 icons**
- **File**: `vite.config.ts` line 32
- **Problem**: Only a 64x64 `favicon.ico` is listed. PWA install requires at least 192x192 and 512x512 PNG icons. Chrome will reject the install prompt without them, making the install banner non-functional.
- **Impact**: The "Install App" feature silently fails on most browsers.

### LOW

**11. `SoundscapeEngine.stop()` uses `(n as any).stop?.()` — unsafe type assertion**
- **File**: `src/lib/soundscapes.ts` line 41
- **Problem**: Calling `.stop()` on non-source AudioNodes (like GainNode, BiquadFilterNode) that don't have a `stop` method. The `?.` prevents errors but the `as any` is unnecessary noise.
- **Fix**: Filter nodes by type or use `instanceof OscillatorNode || instanceof AudioBufferSourceNode`.

**12. `importData()` has no validation — can corrupt app state**
- **File**: `src/lib/storage.ts` lines 155-160
- **Problem**: `importData()` accepts any valid JSON and directly writes it to localStorage. If the imported file has malformed session records (missing `id`, wrong types), the app will crash when trying to render them. No schema validation exists.
- **Fix**: Add basic validation (check required fields exist and are correct types).

---

## Summary Table

| # | Severity | Issue | File |
|---|----------|-------|------|
| 1 | CRITICAL | Mini-player restore loses technique/phase/timer state | Session.tsx |
| 2 | CRITICAL | XSS via `dangerouslySetInnerHTML` + custom technique names | Stats.tsx |
| 3 | HIGH | Soundscape setTimeout leaks on rapid start/stop | soundscapes.ts |
| 4 | HIGH | Calm score labels not localized | coherence.ts |
| 5 | HIGH | Streak shows 0 before first session of the day | storage.ts |
| 6 | MEDIUM | `checkAllBadges()` expensive on every render | Stats.tsx + achievements.ts |
| 7 | MEDIUM | Reminder checker can miss in background tabs | reminders.ts |
| 8 | MEDIUM | `tick` stale closure over `durationMin` | Session.tsx |
| 9 | MEDIUM | Home.tsx lacks memoization for expensive calls | Home.tsx |
| 10 | MEDIUM | PWA manifest missing required icon sizes | vite.config.ts |
| 11 | LOW | Unsafe `as any` in soundscape cleanup | soundscapes.ts |
| 12 | LOW | `importData()` has no validation | storage.ts |

---

## Previously Fixed Issues — Verification

All 14 issues from the first audit were verified as correctly fixed:
- SessionContext timer ticks correctly
- Friend challenges use 7-day window from `acceptedAt`
- `Index.tsx` deleted
- Consistency uses user's `defaultDurationMinutes`
- `moodAfter` saved to session record
- Insights use structured `{ key, params }` objects
- Keyboard shortcuts use refs (no re-creation)
- Calendar uses local date for "today"
- Mood suggestion returns data (not hardcoded English)
- ErrorBoundary wraps the app
- Unused import removed from FriendChallenge

---

## Recommendation

Fix **#1** (mini-player restore) and **#5** (streak logic) first — these directly affect daily user experience. **#2** (XSS) should be fixed by replacing `dangerouslySetInnerHTML` with React elements. **#10** (PWA icons) is essential for the install feature to actually work. The remaining items improve robustness and performance.

