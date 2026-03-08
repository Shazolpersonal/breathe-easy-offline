

# XP System — In-Depth Analysis & Enhancement Plan

## Current State Analysis

### What Exists
The XP system is functional but **basic**. Here's the breakdown:

**Storage:** Single `totalXP` number in localStorage. No history, no breakdown, no XP log.

**Earning XP** (`calculateSessionXP`):
- Base: 10 XP per session
- Duration: +1 XP per minute
- Difficulty multiplier: beginner ×1, intermediate ×1.5, advanced ×2
- Calm score bonus: +5 if score ≥ 80 (binary — no gradient)
- Challenges: +15 per completed challenge
- Streak: +2 per streak day

**Levels:** 10 fixed levels from 0 XP ("Beginner Breather") to 4000 XP ("Enlightened"). Titles are hardcoded in English, translated via locale keys.

**Display:** Home page shows level number, title, total XP, and progress bar. Session done screen shows "+X XP" with level-up notification.

### Weaknesses Identified

1. **No XP breakdown** — user sees "+18 XP" but doesn't know why. No transparency into what earned what.
2. **Flat calm score bonus** — binary: ≥80 gets +5, <80 gets 0. No gradient reward for improvement.
3. **No diminishing returns** — doing 10 beginner 1-minute sessions per day earns more than one focused 10-minute advanced session.
4. **No time-of-day or consistency bonuses** — no "first session of the day" bonus, no "morning routine" reward.
5. **No mood improvement reward** — mood tracking exists but doesn't feed into XP.
6. **Level titles not localized contextually** — stored as English strings, looked up via `xp.${title}` pattern.
7. **No XP history** — can't show "XP earned this week" or trends.
8. **No daily XP cap** — exploitable by spamming short sessions.
9. **Max level (Enlightened) at 4000 XP** — dedicated users hit the ceiling and lose motivation.

---

## Enhancement Plan

### 1. Granular XP Calculation with Breakdown

Replace the flat formula with a multi-factor system that returns an itemized breakdown:

```typescript
interface XPBreakdown {
  base: number;           // 10
  duration: number;       // +1 per min, capped at +15
  difficulty: number;     // multiplier bonus portion
  calmBonus: number;      // gradient: 0-10 based on score
  moodBonus: number;      // +3 to +8 based on mood improvement
  streakBonus: number;    // +2 per day, capped at +20
  firstOfDay: number;     // +5 if first session today
  challengeBonus: number; // +15 per challenge
  total: number;
}
```

**Changes to `calculateSessionXP`:**
- Calm score: gradient bonus (score/10 rounded, so 90→+9, 50→+5, 30→+3)
- Mood improvement: +3 base, +1 per point of improvement (capped at +8)
- First session of day: +5 bonus
- Duration cap: max +15 XP from duration (prevents gaming)
- Daily XP cap: 150 XP per day (prevents spam)
- Return the full breakdown object

### 2. XP History Log

Add an `xpHistory` array to the store:

```typescript
interface XPEntry {
  date: string;
  amount: number;
  source: string; // technique name
}
```

Store last 90 days of entries. Enables "XP this week" display and trend charts.

### 3. Extended Levels (10 → 15)

Add 5 more levels beyond "Enlightened" for long-term users:

| Level | Threshold | Title |
|-------|-----------|-------|
| 11 | 5,000 | Breath Sage |
| 12 | 6,500 | Inner Peace |
| 13 | 8,500 | Transcendent |
| 14 | 11,000 | Eternal Calm |
| 15 | 14,000 | Ascended |

### 4. XP Breakdown Display on Done Screen

Replace the simple "+X XP" with an itemized list showing each bonus line:
```
+10  Base
+4   Duration (4 min)
+7   Calm Score (72%)
+5   First Today
+6   Streak (3 days)
─────
+32  Total XP
```

### 5. XP Stats on Home Page

Enhance the XP card on Home to show:
- Weekly XP earned (from history log)
- Small sparkline or trend indicator

### 6. Localization

Add all new level titles and XP breakdown labels to both `en.ts` and `bn.ts`.

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/xp.ts` | New `XPBreakdown` type, rewrite `calculateSessionXP` to return breakdown, add XP history log, add 5 new levels, add daily cap, add `getWeeklyXP()` helper |
| `src/pages/Session.tsx` | Update `XPEarnedDisplay` to show itemized breakdown, pass mood data to XP calc |
| `src/pages/Home.tsx` | Add weekly XP indicator to XP progress card |
| `src/locales/en.ts` | Add ~15 keys: 5 new level titles, XP breakdown labels (`xp.base`, `xp.duration`, `xp.calmBonus`, `xp.moodBonus`, `xp.firstOfDay`, `xp.streakBonus`, `xp.challengeBonus`, `xp.weeklyXP`) |
| `src/locales/bn.ts` | Matching Bengali translations |

