

# Advanced Analytics — Session Journal, Monthly Reports, Time-of-Day Patterns

## 1. Session Journal

**`src/lib/storage.ts`**: Add optional `journal?: string` to `SessionRecord`.

**`src/pages/Session.tsx`** (done screen): Add a `Textarea` below mood picker for an optional note. Save it into the session record before navigating away.

**`src/pages/Stats.tsx`**: Add a third tab "Journal" showing a reverse-chronological timeline of sessions that have journal entries — date, technique name, duration, calm score, and the note text.

---

## 2. Monthly/Yearly Reports

**`src/pages/Stats.tsx`**: Add a "Reports" section (or 4th tab) with a month/year selector. Auto-generate a summary card from `SessionRecord` data:
- Total minutes, total sessions
- Most-used technique (group by `techniqueId`, count)
- Longest streak within that period
- Average calm score
- Presented as a styled card with readable text

---

## 3. Time-of-Day Patterns

**`src/pages/Stats.tsx`**: Add a bar chart (using existing recharts) showing session distribution by hour of day (0-23h, grouped into 4-6 buckets like "Morning 6-9", "Midday 9-12", "Afternoon 12-17", "Evening 17-21", "Night 21-6"). Derived from `session.date` ISO string's hour component.

---

## File Changes

| File | Action |
|---|---|
| `src/lib/storage.ts` | Add `journal?: string` to `SessionRecord` |
| `src/pages/Session.tsx` | Add journal textarea on done screen, save to record |
| `src/pages/Stats.tsx` | Add Journal tab, Monthly Report card, Time-of-Day chart |

