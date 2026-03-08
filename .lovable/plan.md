

# 8 Advanced Zero-Cost Features

All features use only browser APIs and localStorage — no backend, no costs, sustainable for years.

## Feature 1: Screen Wake Lock During Sessions
**Problem:** Phone screen turns off during breathing sessions, interrupting the flow.
**Solution:** Use the Web Wake Lock API to keep the screen awake while a session is active.

**Files:**
- `src/lib/wakeLock.ts` — Create utility: `requestWakeLock()`, `releaseWakeLock()`
- `src/pages/Session.tsx` — Acquire wake lock on session start, release on stop/done/unmount

## Feature 2: Daily Goal with Visual Progress Ring
**Problem:** Users lack a daily target to aim for.
**Solution:** Add a configurable daily minute goal (default: 5 min). Show a circular progress ring on the Home page that fills as the user completes sessions.

**Files:**
- `src/lib/storage.ts` — Add `dailyGoalMinutes` to `AppSettings`
- `src/pages/Home.tsx` — Replace the plain "min today" stat with an animated SVG ring showing progress toward goal
- `src/pages/Settings.tsx` — Add daily goal slider (1–60 min) in General section
- `src/locales/en.ts`, `src/locales/bn.ts` — Add goal-related translations

## Feature 3: Quick Resume (Last Session Shortcut)
**Problem:** Users repeat the same technique/duration daily but must navigate through multiple taps.
**Solution:** Save the last session config (technique, duration) in localStorage. Show a "Resume Last" card on Home with one-tap start.

**Files:**
- `src/lib/storage.ts` — Add `getLastSessionConfig()` / `saveLastSessionConfig()`
- `src/pages/Home.tsx` — Add a "Resume Last" card below Smart Suggestion showing last technique + duration with a single-tap start button
- `src/pages/Session.tsx` — Call `saveLastSessionConfig()` when a session starts
- `src/locales/en.ts`, `src/locales/bn.ts` — Translations

## Feature 4: One-Tap Clipboard Backup & Paste Restore
**Problem:** Export/import via files is cumbersome on mobile. Users want the easiest possible backup.
**Solution:** Add "Copy Backup" button that copies all data as a compressed Base64 string to clipboard. Add "Paste Restore" button that reads from clipboard and restores. Simple, works across devices via any messaging app.

**Files:**
- `src/lib/storage.ts` — Add `exportDataCompact()` (Base64-encoded JSON) and `importDataFromCompact()`
- `src/pages/Settings.tsx` — Add "Copy Backup to Clipboard" and "Restore from Clipboard" buttons in the Data section
- `src/locales/en.ts`, `src/locales/bn.ts` — Translations

## Feature 5: Session History Manager
**Problem:** Users can see stats and journal entries but cannot view, search, or delete individual session records.
**Solution:** Add a "History" tab in Stats showing a searchable, scrollable list of all sessions with date, technique, duration, calm score. Each entry has a delete button with confirmation.

**Files:**
- `src/lib/storage.ts` — Add `deleteSession(id)` function
- `src/pages/Stats.tsx` — Add "history" tab with session list, search input, delete functionality
- `src/locales/en.ts`, `src/locales/bn.ts` — Translations

## Feature 6: Weekly Summary Card
**Problem:** Users don't get a periodic review of their progress.
**Solution:** Generate a weekly summary card (viewable + shareable as image) showing: total sessions, total minutes, streak, XP earned, best calm score, most-used technique — for the past 7 days.

**Files:**
- `src/lib/weeklySummary.ts` — Compute weekly stats from session data
- `src/components/WeeklySummary.tsx` — Beautiful summary card component with share button
- `src/pages/Home.tsx` — Show the weekly summary card on Sundays or when user hasn't seen it this week
- `src/locales/en.ts`, `src/locales/bn.ts` — Translations

## Feature 7: Breathing Pattern Preview Animation
**Problem:** Users can't visualize a breathing technique's rhythm before starting a session.
**Solution:** Add a small animated preview (pulsing dot) on each technique card that loops through inhale/hold/exhale phases at 2x speed when the user taps a preview button.

**Files:**
- `src/components/TechniqueCard.tsx` — Add a small "Preview" toggle button that shows a mini breathing animation
- `src/components/BreathingPreview.tsx` — Compact animated circle that cycles through technique phases

## Feature 8: Auto-Difficulty Progression Suggestions
**Problem:** Users plateau at the same duration without knowing when to level up.
**Solution:** After completing a session, if the user's avg calm score for that technique is consistently high (>75) over the last 5 sessions, suggest increasing duration by 1 minute. Show a subtle suggestion banner on the done screen.

**Files:**
- `src/lib/adaptive.ts` — Add `shouldSuggestIncrease(techniqueId)` function
- `src/pages/Session.tsx` — On the done screen, check and show a "Ready to level up?" banner with a button to set new default duration
- `src/locales/en.ts`, `src/locales/bn.ts` — Translations

## Implementation Order
1. Screen Wake Lock (smallest, highest impact)
2. Daily Goal Ring
3. Quick Resume
4. One-Tap Clipboard Backup
5. Session History Manager
6. Weekly Summary Card
7. Breathing Pattern Preview
8. Auto-Difficulty Suggestions

## Technical Notes
- All features use only localStorage + Web APIs (Wake Lock, Clipboard, Canvas)
- Zero external dependencies added
- All strings localized in both English and Bengali
- No backend, no costs, fully offline-capable

