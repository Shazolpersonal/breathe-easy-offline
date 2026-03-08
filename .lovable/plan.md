

# 8 Advanced Updates to Existing Features

All updates use browser APIs and localStorage — zero cost, fully offline.

## Update 1: Estimated Finish Time
**File:** `src/pages/Session.tsx`
- Calculate end time: `new Date(Date.now() + durationMin * 60000)`
- Display "Ends at 10:35 PM" below the timer during active session

## Update 2: Backup Reminder Banner
**Files:** `src/pages/Home.tsx`, `src/lib/storage.ts`
- Check `getLastBackupDate()` — if null or >7 days, show dismissible banner
- Banner links to Settings backup section

## Update 3: Journal Inspiration (Ghost Text)
**Files:** `src/lib/storage.ts`, `src/pages/Session.tsx`
- Add `getLastJournalForTechnique(techniqueId)` to storage
- Show previous journal as placeholder text in journal textarea on done screen

## Update 4: Streak Freeze (1 Free Miss/Week)
**Files:** `src/lib/storage.ts`, `src/pages/Home.tsx`
- Modify `getCurrentStreak()` to allow one gap per 7-day window
- Track `streakFreezeUsedThisWeek` in localStorage
- Show "🛡️" indicator on streak display when freeze is available

## Update 5: Breathing Rate Metric
**File:** `src/pages/Session.tsx`
- Calculate: `completedCycles / (elapsedSeconds / 60)` = breaths per minute
- Display on done screen alongside Calm Score

## Update 6: Auto-Backup Every 10 Sessions
**Files:** `src/lib/storage.ts`, `src/pages/Session.tsx`, `src/pages/Settings.tsx`
- Add `autoBackupEnabled` to AppSettings (default: false)
- Add `sessionCountSinceBackup` counter
- On session save, if count reaches 10 and enabled, auto-copy backup to clipboard + toast

## Update 7: Post-Session Technique Recommendation
**Files:** `src/lib/suggestions.ts`, `src/pages/Session.tsx`
- Add `getPostSessionSuggestion(moodAfter)` — recommend calming technique if mood is low, energizing if high
- Show suggestion card on done screen after mood selection

## Update 8: QR Code Backup Transfer
**Files:** `src/lib/qrBackup.ts` (new), `src/pages/Settings.tsx`
- Generate QR code from backup data using Canvas API (split into chunks if needed)
- Add "Show QR Code" button in Settings that displays QR in a dialog
- Add camera-based QR scanner for restore (using `getUserMedia` + jsQR pattern recognition)

## Localization
All 8 features get English and Bengali translations in `src/locales/en.ts` and `src/locales/bn.ts`.

## Implementation Order
1. Estimated Finish Time (simplest)
2. Breathing Rate Metric
3. Journal Inspiration
4. Backup Reminder Banner
5. Streak Freeze
6. Post-Session Recommendation
7. Auto-Backup
8. QR Code Transfer (most complex)

