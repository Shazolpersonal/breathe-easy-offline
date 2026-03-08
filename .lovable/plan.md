

# 8 Bug Fixes & UX Improvements for a Bug-Free, User-Friendly App

All updates use only browser APIs and localStorage — sustainable, zero-cost, offline-capable.

---

## Update 1: MiniPlayer Session Save on Stop
**Problem:** When users tap the X button on the MiniPlayer, the session is discarded without saving. Users lose valuable progress data.

**Solution:** Before stopping, save the partial session to localStorage if elapsed > 30 seconds. Show a confirmation toast.

**Files:**
- `src/components/MiniPlayer.tsx` — Add save logic before `stopMiniSession()`, import addSession
- `src/locales/en.ts`, `src/locales/bn.ts` — Add "session.savedPartial" translation

---

## Update 2: Offline Status Indicator
**Problem:** Users don't know if they're offline, which can cause confusion about app behavior.

**Solution:** Add a small offline banner that appears when `navigator.onLine` is false. Show it at the top of the screen with a subtle animation.

**Files:**
- `src/components/OfflineIndicator.tsx` — Create new component using `useEffect` with `online`/`offline` event listeners
- `src/App.tsx` — Include OfflineIndicator in AppInner
- `src/locales/en.ts`, `src/locales/bn.ts` — Add "common.offline" translation

---

## Update 3: Confirm Before Discarding Journal
**Problem:** If a user types a journal entry on the session done screen but navigates away, the text is lost without warning.

**Solution:** Add a `beforeunload` listener and show a confirmation dialog if journal text exists when navigating away.

**Files:**
- `src/pages/Session.tsx` — Add `useEffect` with `beforeunload` event listener when `journalNote.length > 0`
- Modify "Done" and "Practice Again" buttons to call `saveJournal()` first (already partially done, reinforce)

---

## Update 4: Session Recovery from Browser Close
**Problem:** If the browser crashes or closes during a session, all progress is lost.

**Solution:** Auto-save session state to `sessionStorage` every 10 seconds. On mount, detect incomplete session and offer to resume.

**Files:**
- `src/pages/Session.tsx` — Add periodic `sessionStorage` save during "running" state; add recovery dialog on mount
- `src/components/SessionRecoveryDialog.tsx` — Create recovery prompt UI
- `src/locales/en.ts`, `src/locales/bn.ts` — Add recovery translations

---

## Update 5: Enhanced Import Validation with Error Details
**Problem:** Import shows generic "Invalid file" error. Users don't know what's wrong.

**Solution:** Show specific validation errors (missing fields, invalid format, corrupted data) with clear guidance.

**Files:**
- `src/lib/storage.ts` — Refactor `importData` to return detailed validation results instead of throwing generic errors
- `src/pages/Settings.tsx` — Update import handler to show specific error messages
- `src/locales/en.ts`, `src/locales/bn.ts` — Add granular import error translations

---

## Update 6: Haptic Feedback on Key Actions
**Problem:** Some important buttons lack tactile feedback (start session, complete challenge, etc.).

**Solution:** Add subtle haptic patterns for: session start, session complete, challenge complete, badge unlock, favorite toggle.

**Files:**
- `src/lib/haptics.ts` — Add `vibrateSuccess()`, `vibrateButton()` patterns
- `src/pages/Session.tsx` — Add haptics to start button
- `src/pages/Home.tsx` — Add haptics to challenge complete celebration
- `src/components/TechniqueCard.tsx` — Add haptics to favorite toggle

---

## Update 7: Accessibility Improvements
**Problem:** Some interactive elements lack proper ARIA labels, skip links, and focus management.

**Solution:** Add skip-to-main link, improve ARIA labels on all icon buttons, add focus trap in modals.

**Files:**
- `src/App.tsx` — Add skip link at top
- `src/components/BottomNav.tsx` — Add aria-current to active tab
- `src/pages/Session.tsx` — Add aria-live regions for phase changes and countdown
- `src/components/MiniPlayer.tsx` — Improve button aria-labels

---

## Update 8: Smart Duplicate Detection on Import
**Problem:** Importing the same backup twice creates duplicate sessions.

**Solution:** Check for existing session IDs before import and offer to skip duplicates or overwrite.

**Files:**
- `src/lib/storage.ts` — Add `importDataSmart()` that detects duplicates by session ID
- `src/pages/Settings.tsx` — Use smart import with duplicate handling dialog
- `src/locales/en.ts`, `src/locales/bn.ts` — Add duplicate detection translations

---

## Implementation Order
1. MiniPlayer Session Save (highest user impact)
2. Session Recovery from Browser Close
3. Confirm Before Discarding Journal
4. Haptic Feedback on Key Actions
5. Enhanced Import Validation
6. Smart Duplicate Detection
7. Offline Status Indicator
8. Accessibility Improvements

## Technical Notes
- All features use localStorage + sessionStorage + browser events
- No external dependencies
- Full localization in English and Bengali
- Zero cost, fully offline-capable
- Backward compatible with existing data

