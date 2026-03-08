

# Deep Analytics — 3 Features

## Feature 1: Weekly AI Insights Report

Generate text-based insights by analyzing localStorage session data. Pure local computation, no API needed.

**New file**: `src/lib/insights.ts`
- `getWeeklyInsights(): string[]` — returns 3-6 insight strings by analyzing last 7 days of sessions:
  - **Best time**: Find the hour with highest avg calm score → "You breathe best at 7am"
  - **Technique comparison**: Compare mood improvement per technique → "Box Breathing improved your mood 40% more than 4-7-8 this week"
  - **Streak tracking**: Compare current streak to longest → "You're on track for your longest streak ever" or "3 more days to beat your record"
  - **Consistency**: Note if sessions increased/decreased vs prior week
  - **Duration trend**: "You averaged 6 min per session, up from 4 min last week"
  - **Mood trend**: Average mood-before vs mood-after delta for the week
- Falls back to encouraging messages when insufficient data (<3 sessions this week)

**UI**: New "insights" tab in Stats page (replace or add alongside existing tabs). Shows insight cards with icons (Lightbulb, TrendingUp, etc.) in a vertical list.

## Feature 2: Mood Heatmap Calendar

Replace the existing 30-day heatmap dots with a proper month-view calendar grid color-coded by mood.

**Implementation in Stats.tsx**:
- Full calendar grid (7 columns for days of week, proper month layout with offset for first day)
- Each day cell color-coded:
  - No session: muted/gray
  - Has session but no mood: primary at low opacity
  - Mood 1-2: red/orange tones
  - Mood 3: yellow
  - Mood 4-5: green tones
- Small dot indicator for number of sessions that day (1 dot, 2 dots, 3+ dots)
- Month navigation (reuse existing prev/next month controls)
- Tapping a day shows a tooltip/popover with that day's sessions summary

Uses the existing `getMoodRecords()` from `src/lib/mood.ts` combined with `getSessions()`.

## Feature 3: Breathing Consistency Score

A weekly score (0-100) based on three weighted factors.

**New file**: `src/lib/consistency.ts`
- `getConsistencyScore(): { score: number, breakdown: { regularity, completion, streak } }`
- **Regularity (40%)**: How many of the last 7 days had at least one session. 7/7 = 100%, 5/7 = 71%, etc.
- **Completion (30%)**: Average session completion rate (actual duration / target duration). Capped at 100%.
- **Streak (30%)**: Current streak relative to 7 days. streak >= 7 = 100%, streak 3 = 43%, etc.
- Weighted sum → final 0-100 score

**UI**: 
- Show as a prominent card at the top of the Stats overview tab with a circular progress ring and breakdown bars
- Color: red (<40), yellow (40-70), green (>70)

## File Changes

| File | Action |
|---|---|
| `src/lib/insights.ts` | New — weekly insight generator |
| `src/lib/consistency.ts` | New — consistency score calculator |
| `src/pages/Stats.tsx` | Add insights tab, mood heatmap calendar, consistency score card |
| `src/locales/en.ts` | ~30 new keys |
| `src/locales/bn.ts` | ~30 new keys |

## Execution Order

1. Consistency Score (simplest, self-contained calculation + UI card)
2. Mood Heatmap Calendar (replaces existing heatmap, uses mood data)
3. Weekly Insights (most logic, new tab)

