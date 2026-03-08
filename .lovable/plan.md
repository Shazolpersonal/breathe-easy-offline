

# Social & Motivation — 3 Features

## Feature 1: Challenge a Friend

Generate a shareable URL with encoded challenge parameters (technique, target duration/cycles, date). No server needed — all data encoded in URL hash.

**New file**: `src/lib/friendChallenge.ts`
- `generateChallengeLink(params)` — encodes `{ techniqueId, targetMinutes, targetCycles, challengerName, date }` as base64 in a URL hash fragment (e.g., `#challenge=eyJ...`)
- `parseChallengeLink(url)` — decodes the hash back to challenge params
- `saveFriendChallenge(challenge)` / `getFriendChallenges()` — persist accepted challenges in localStorage
- Challenge tracking: compare today's sessions against challenge goal

**New component**: `src/components/FriendChallenge.tsx`
- **Create mode**: Form to pick technique, target (minutes or cycles), enter your name → generates link with copy/share button (uses `navigator.share` or clipboard)
- **Accept mode**: When app loads with `#challenge=...` in URL, show a modal with challenge details + "Accept Challenge" button

**Integration**:
- `Home.tsx`: Add a "Challenge a Friend" button/card in the social section
- `App.tsx`: Check for `#challenge=` on mount, show accept modal
- Active challenges shown on Home below daily challenges with progress tracking

## Feature 2: Daily Breathing Quote

Date-seeded rotating motivational quotes on the home screen. Same pattern as `getDailyChallenges()`.

**New file**: `src/lib/quotes.ts`
- Pool of ~30 breathing/mindfulness quotes with attribution
- `getDailyQuote()` — uses the same `hashDate()` pattern from challenges.ts to pick a deterministic quote per day
- Quotes stored as `{ text, author }` objects

**UI**: Add a quote card on `Home.tsx` between the greeting and stats row — italic text with author attribution, subtle styling.

## Feature 3: Export to Health Apps (.csv)

Generate downloadable CSV files from session data, compatible with health tracking apps.

**New file**: `src/lib/csvExport.ts`
- `exportSessionsCSV()` — generates CSV with headers: `Date, Time, Technique, Duration (min), Cycles, Mood Before, Mood After, Calm Score, Breath Accuracy, Heart Rate, Coherence`
- Proper CSV escaping, ISO date formatting
- Downloads as `muhurto-sessions-YYYY-MM-DD.csv`

**Integration**:
- `Settings.tsx`: Add "Export CSV" button next to existing JSON export in the Data section

## File Changes

| File | Action |
|---|---|
| `src/lib/friendChallenge.ts` | New — challenge link encoding/decoding + localStorage |
| `src/lib/quotes.ts` | New — quote pool + daily selector |
| `src/lib/csvExport.ts` | New — CSV generation + download |
| `src/components/FriendChallenge.tsx` | New — create/accept challenge UI |
| `src/pages/Home.tsx` | Add daily quote card + challenge button + active challenges |
| `src/App.tsx` | Check for `#challenge=` on mount |
| `src/pages/Settings.tsx` | Add CSV export button |
| `src/locales/en.ts` | ~40 new keys |
| `src/locales/bn.ts` | ~40 new keys |

## Execution Order

1. Daily Breathing Quote (simplest, self-contained)
2. Export to Health Apps CSV (simple utility + one button)
3. Challenge a Friend (most complex, URL encoding + accept flow + tracking)

