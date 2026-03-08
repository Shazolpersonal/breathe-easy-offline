

# Statistics Feature — In-Depth Analysis & Enhancement Plan

## Current State

### What Exists (5 tabs)
1. **Stats Overview** — Streak cards, total minutes, session count, avg calm score, weekly bar chart, time-of-day bar chart, calm trend line chart, mood heatmap calendar
2. **Insights** — Weekly AI-style text insights (best time, technique comparisons, streak tracking)
3. **Badges** — 15 badges with unlocked/locked grid display
4. **Journal** — Chronological list of session journal entries
5. **Reports** — Monthly report with session count, minutes, top technique, calm score, streak

### Data Backup
- JSON export/import in Settings (full app data)
- CSV export of sessions
- All data in localStorage — zero server cost

### Weaknesses Identified

1. **No "all-time" summary** — No lifetime totals card (total sessions, total hours, total days practiced, total XP earned)
2. **No technique breakdown** — Can't see which technique you use most, or which gives best calm scores
3. **Weekly chart is only 7 days** — No way to see 30-day or 90-day trends
4. **Calm trend shows raw sessions** — No rolling average, making it noisy and hard to read
5. **No mood trend chart** — Mood heatmap exists but no line chart showing mood improvement over time
6. **No XP chart** — XP history is tracked (90 days) but never visualized
7. **Reports are text-only** — Monthly reports have no charts, just numbers and text
8. **Badge progress not shown** — Locked badges don't show how close you are (e.g., "37/50 sessions")
9. **No data size indicator** — User doesn't know how much data they have stored or when to back up
10. **Export doesn't include XP, mood records, or challenge history** — `exportData()` only covers sessions, settings, custom techniques, and favorites. Restoring a backup loses XP progress, mood records, and challenge history.

---

## Enhancement Plan

### 1. Complete Data Export/Import (Critical Fix)

The current `exportData()` misses 3 localStorage keys:
- `breathe_xp` (XP total + 90-day history)
- `breathe_mood_records` (all mood tracking)
- `breathe_challenge_history` (challenge completions)

**Fix**: Include all keys in export, restore all on import. This ensures users can fully back up and reload their data across devices with zero data loss. Also add a "Last backup" timestamp and a reminder if data hasn't been backed up in 30+ days.

### 2. Lifetime Summary Card

Add a prominent card at the top of the Stats overview showing:
- Total sessions (all-time)
- Total hours practiced
- Total days practiced (unique dates)
- Total XP earned
- Member since (date of first session)

### 3. Technique Performance Breakdown

New section in Stats overview — a horizontal bar chart showing:
- Sessions per technique (sorted by count)
- Average calm score per technique
- Lets users see which techniques they favor and which produce the best results

### 4. Flexible Time Range for Weekly Chart

Replace the fixed 7-day chart with a range selector: **7 days / 30 days / 90 days**. Uses the same `recharts` BarChart, just with more data points. For 30/90 days, aggregate by week to keep it readable.

### 5. Mood Trend Line Chart

Add a line chart showing average daily mood (after-session) over the last 30 days. Uses existing `breathe_mood_records` data. Shows the rolling 7-day average as a smoothed overlay line.

### 6. XP Earned Chart

Visualize the XP history (already stored in `breathe_xp.history`) as a bar chart on the Stats page — daily XP for the last 30 days. Reuses recharts.

### 7. Enhanced Monthly Reports with Charts

Add mini bar charts to the Reports tab:
- Daily minutes for the selected month (bar chart)
- This makes the report feel like a real analytics dashboard

### 8. Badge Progress Indicators

For locked badges, show progress toward unlocking:
- "37/50 sessions" for Deep Diver
- "4/7 day streak" for Week Warrior
- Progress bar under each locked badge

This requires adding a `progress` function to each badge definition that returns `{ current: number; target: number }`.

### 9. Backup Health Indicator

In Settings, show:
- "Data size: X sessions, X journal entries, X mood records"
- "Last backup: 12 days ago" (store timestamp on export)
- Warning banner if no backup in 30+ days

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/storage.ts` | Add XP, mood records, challenge history to `exportData()`/`importData()`. Add last-backup timestamp. |
| `src/pages/Stats.tsx` | Add lifetime summary card, technique breakdown chart, time range selector for weekly chart, XP chart, mood trend chart, enhanced reports with mini charts |
| `src/lib/achievements.ts` | Add `progress()` function to each badge returning `{ current, target }` |
| `src/pages/Settings.tsx` | Add backup health indicator (data size, last backup date, warning) |
| `src/locales/en.ts` | ~20 new keys for lifetime stats labels, time range selector, technique breakdown, backup health |
| `src/locales/bn.ts` | Matching Bengali translations |

### Technical Notes
- All computation stays client-side (localStorage + JS). Zero server cost, works offline forever.
- recharts (already installed) handles all new charts.
- No new dependencies needed.
- Data portability is improved by making export/import cover 100% of app state.

