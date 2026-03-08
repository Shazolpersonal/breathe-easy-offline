

# Mood Tracker + Adaptive Suggestions

## Overview

Add a mood check-in before and after each breathing session. The app tracks which techniques produce the best mood improvements for each starting mood, then uses that data to make smarter suggestions. All data stored in localStorage.

## Data Model

**Moods** — 5 emoji-based levels:
`😫 Stressed` · `😟 Anxious` · `😐 Neutral` · `🙂 Good` · `😌 Calm`

**MoodRecord** (stored in localStorage):
```ts
interface MoodRecord {
  sessionId: string;
  techniqueId: string;
  moodBefore: number;   // 1-5
  moodAfter: number | null;  // 1-5, null if skipped
  date: string;
}
```

**Scoring logic** — For each `(moodBefore, techniqueId)` pair, compute average improvement (`moodAfter - moodBefore`). The technique with the highest average improvement for the user's current mood gets suggested.

## Changes

### 1. `src/lib/mood.ts` (new)
- Mood definitions (emoji, label, value 1-5)
- localStorage CRUD for mood records
- `getBestTechniqueForMood(currentMood: number): string | null` — queries all mood records, groups by technique, returns the one with highest average improvement for that mood level. Falls back to null if insufficient data (<3 records).

### 2. `src/components/MoodPicker.tsx` (new)
- Horizontal row of 5 emoji buttons with labels
- Selected state highlights the chosen mood
- Accepts `onSelect(mood: number)` callback
- Compact, fits naturally in the session flow

### 3. `src/pages/Session.tsx` (modify)
- **Before session (idle state):** Show MoodPicker above the Start button. Store selected mood in state.
- **After session (done state):** Show MoodPicker asking "How do you feel now?" before the Done/Again buttons. On selection, save the full MoodRecord to localStorage.
- Session flow: `Pick mood → Start → Breathe → Done → Pick mood after → Save`

### 4. `src/lib/suggestions.ts` (modify)
- Import mood scoring function
- New `getAdaptiveSuggestion()`: If user picks a mood on the home page's suggestion card, check if there's enough mood data to recommend a technique. If yes, use the best-scored technique. If no data yet, fall back to existing time-of-day logic.

### 5. `src/components/SmartSuggestion.tsx` (modify)
- Add a small "How are you feeling?" mood picker inline
- When user taps a mood, the suggestion updates to show the adaptive recommendation (or falls back to time-based)

### 6. `src/lib/storage.ts` (modify)
- Add `moodBefore` and `moodAfter` optional fields to `SessionRecord` so mood data travels with session data in export/import

## UX Flow

```text
HOME:  [😫 😟 😐 🙂 😌] "How are you feeling?"
       → picks 😟 → suggestion updates: "When you're anxious, Box Breathing helped most"
       → taps Start

SESSION IDLE:  Mood already selected from home (or pick here)
               → Start breathing

SESSION DONE:  "How do you feel now?" [😫 😟 😐 🙂 😌]
               → picks 😌 → saves record → shows improvement "+3 mood boost!"
               → Done / Again buttons
```

The adaptive engine improves over time as the user completes more sessions — the more data, the better the suggestions become.

