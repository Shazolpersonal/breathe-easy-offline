

# Statistics Section — Real User Testing Report

## Testing Scope
Exhaustive review of all 5 tabs: Overview, Insights, Badges, Journal, Reports — plus sub-components (ConsistencyCard, MoodHeatmapCalendar, InsightsTab) and supporting libraries (consistency.ts, achievements.ts, insights.ts, mood.ts, csvExport.ts, coherence.ts).

---

## Issues Found

### BUG 1 — HIGH: Streak & longest streak not memoized on Stats page

**File**: `src/pages/Stats.tsx` lines 19-20

`getCurrentStreak()` and `getLongestStreak()` are called directly on every render — not inside `useMemo`. Each one parses all sessions from `localStorage`, deduplicates dates, and runs streak logic. Meanwhile `sessions` is memoized on line 17 but these two are not.

**Fix**: Wrap both in `useMemo` with `[sessionsKey]` dependency.

---

### BUG 2 — HIGH: ConsistencyCard calls `getSessions()` independently on every render

**File**: `src/components/stats/ConsistencyCard.tsx` line 6

`getConsistencyScore()` internally calls `getSessions()` and `getCurrentStreak()` (which also calls `getSessions()`). This means the Stats Overview tab parses localStorage **4 separate times** on mount: once in Stats.tsx, once in ConsistencyCard, and twice inside consistency.ts. No memoization — the component re-calls on every render.

**Fix**: Either pass sessions as a prop from the parent, or wrap the call in `useMemo`.

---

### BUG 3 — HIGH: MoodHeatmapCalendar calls `getSessions()` and `getMoodRecords()` on every render without memoization

**File**: `src/components/stats/MoodHeatmapCalendar.tsx` lines 11-12

`getSessions()` and `getMoodRecords()` are called at the top level of the component, outside any `useMemo`. The `calendarData` memo depends on `sessions` and `moodRecords`, but since those are new arrays on every render, the memo recomputes every time — defeating its purpose entirely.

**Fix**: Wrap `getSessions()` and `getMoodRecords()` in `useMemo(() => ..., [])`.

---

### BUG 4 — MEDIUM: Stat cards grid shows odd layout with 5 items in a 2-column grid

**File**: `src/pages/Stats.tsx` lines 159-177

When `avgCalmScore` is not null, there are 5 stat cards in a `grid-cols-2` layout. The 5th card (Avg Calm) sits alone on the last row, left-aligned, creating an asymmetric layout. This looks unfinished.

**Fix**: Either make the 5th card span full width (`col-span-2`), or reorganize into a different layout when there are 5 items.

---

### BUG 5 — MEDIUM: Mood labels in `mood.ts` are hardcoded English

**File**: `src/lib/mood.ts` lines 10-16

`MOODS` array has `label: "Stressed"`, `"Anxious"`, `"Neutral"`, `"Good"`, `"Calm"` — all hardcoded English. `getMoodLabel()` returns these directly. While the heatmap calendar uses emojis (which are language-neutral), any component using `getMoodLabel()` will show English text regardless of language setting.

**Fix**: Change labels to locale keys and resolve them via `t()` at the component level, or add a `getMoodLabelKey()` function.

---

### BUG 6 — MEDIUM: `week-warrior` and `consistent` badges bypass sessions parameter

**File**: `src/lib/achievements.ts` lines 41, 104

These two badge checks call `getCurrentStreak()` directly (which internally calls `getSessions()`) instead of using the `sessions` parameter passed to `check()`. This means:
1. They parse localStorage independently even though sessions were already loaded
2. They can't benefit from the memoized sessions passed from Stats.tsx

**Fix**: Compute streak from the passed sessions array, or accept that these two always re-read storage.

---

### BUG 7 — MEDIUM: CSV export headers are hardcoded English

**File**: `src/lib/csvExport.ts` lines 16-28

Headers like "Date", "Time", "Technique", "Duration (min)" etc. are all English. Not a functional bug — CSV is a data format — but Bengali-speaking users downloading their data see English column names.

**Fix**: Accept language parameter and use localized headers, or keep English for data interoperability (arguably correct for CSV).

---

### BUG 8 — LOW: Insights time format uses English AM/PM for Bengali users

**File**: `src/lib/insights.ts` lines 52-54

The best-time insight formats the hour as `${h12}${ampm}` producing "3pm" or "7am". Bengali users should see the localized time format. This is a minor i18n gap.

**Fix**: Use locale-appropriate time formatting or add "am/pm" to the locale file.

---

### BUG 9 — LOW: Report summary bold-formatting only bolds the first number

**File**: `src/pages/Stats.tsx` lines 327-330

The `.split(String(reportData.totalMin)).flatMap(...)` approach only bolds the `totalMin` value. The session count and month name remain plain text. The original intent was to bold key numbers for visual emphasis, but only one gets styled.

**Fix**: Either bold all key values (sessions count, month) or remove the partial bolding for consistency.

---

### BUG 10 — LOW: No empty state animation or encouragement on Stats Overview when zero sessions

**File**: `src/pages/Stats.tsx` lines 155-218

When a new user visits Stats with zero sessions, they see: ConsistencyCard (score 0), all stat cards showing 0, empty bar charts, and an empty heatmap. There's no welcoming empty state or nudge to complete their first session. Compare this to the Journal and Reports tabs which have proper empty states with icons and messages.

**Fix**: Add a welcoming empty state when `sessions.length === 0` for the overview tab.

---

## Summary Table

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | HIGH | Streak calculations not memoized | Stats.tsx |
| 2 | HIGH | ConsistencyCard re-parses localStorage every render | ConsistencyCard.tsx |
| 3 | HIGH | MoodHeatmapCalendar memo dependencies are unstable | MoodHeatmapCalendar.tsx |
| 4 | MEDIUM | 5th stat card orphaned in 2-col grid | Stats.tsx |
| 5 | MEDIUM | Mood labels hardcoded English | mood.ts |
| 6 | MEDIUM | Two badges bypass sessions param | achievements.ts |
| 7 | MEDIUM | CSV headers English-only | csvExport.ts |
| 8 | LOW | AM/PM not localized in insights | insights.ts |
| 9 | LOW | Only first number bolded in report | Stats.tsx |
| 10 | LOW | No empty state for overview tab | Stats.tsx |

---

## Recommendation

**Priority 1** — Fix #1, #2, #3 (performance): These cause redundant `localStorage` parsing on every render. On a device with hundreds of sessions, the Stats page will feel sluggish. All three are straightforward `useMemo` wraps.

**Priority 2** — Fix #4 and #10 (UX polish): The orphaned 5th card and missing empty state are the most visible UX gaps.

**Priority 3** — Fix #5 and #8 (i18n): Mood labels and AM/PM formatting break the Bengali experience.

