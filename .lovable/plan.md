

# Daily Challenges — In-Depth Analysis & Enhancement Plan

## Current State Analysis

### What Exists
- **Pool of 10 challenges**, 3 picked daily via date-seeded hash
- **Challenge types**: session count, duration, cycle count, calm score threshold, time-of-day, technique variety
- **Display**: Simple checklist on Home with progress counters (e.g., 2/3)
- **XP integration**: `completedChallenges` count fed into `calculateSessionXP` for +15 XP each

### Weaknesses

1. **No difficulty scaling** — A day-1 user sees "Complete 3 sessions" the same as a 100-day veteran. No adaptation to user level or history.
2. **No completion tracking** — No record of how many daily challenges the user has completed historically. Can't show "You've completed 47 daily challenges this month."
3. **No streak for challenges** — App tracks session streaks but not "days where all 3 challenges were completed."
4. **Redundant challenges** — "Breathe for 5 min" and "Breathe for 10 min" are separate items; "Complete 2 sessions" and "Complete 3 sessions" overlap. The pool is small and repetitive.
5. **No category diversity guarantee** — The hash-based picker can select 3 duration-based challenges on the same day. No logic ensures variety.
6. **Static targets** — "Complete 5 cycles" is the same whether the user averages 2 or 20 cycles per session.
7. **No reward beyond XP** — Completing all 3 daily challenges gives no special recognition or bonus.
8. **No progress persistence** — If the user completes a challenge, there's no visual celebration or toast. Just a checkmark icon swap.
9. **"Try a new technique"** is misleading — it checks if today's sessions use ≥2 techniques, not whether the user tried one they've *never* used before.

---

## Enhancement Plan

### 1. Difficulty Tiers Based on User Level

Challenges scale with the user's XP level. The pool is split into 3 tiers:

| Tier | XP Level | Example |
|------|----------|---------|
| Easy | 1-5 | Complete 1 session, Breathe 3 min |
| Medium | 4-10 | Complete 3 sessions, Calm score > 70 |
| Hard | 8-15 | Breathe 15 min, Calm score > 85, 20 cycles |

Daily picker selects 1 from each tier (guaranteed variety in difficulty).

### 2. Category Tags & Diversity Guarantee

Each challenge gets a `category` tag: `"duration"`, `"sessions"`, `"quality"`, `"timing"`, `"exploration"`. The picker ensures no two challenges share a category on the same day.

### 3. Expanded Challenge Pool (10 → 20+)

Add new challenges:
- Mood improvement: "Improve mood by +2 in a session"
- Technique-specific: "Try an advanced technique"
- Heart rate: "Achieve heart coherence > 70" (if enabled)
- Exploration: "Try a technique you've never used" (checks all-time history, not just today)
- Endurance: "Complete 15+ cycles in one session"
- Consistency: "Complete a session before noon"

### 4. Challenge Completion History & Streak

New localStorage key `breathe_challenge_history`:
```typescript
interface ChallengeHistoryEntry {
  date: string;        // ISO date
  completed: number;   // how many of 3 completed
  total: number;       // always 3
}
```

Track daily completions. Derive:
- **Challenge streak**: consecutive days with all 3 completed
- **Monthly completion rate**: "You completed 85% of challenges this month"
- **Total challenges completed** (all-time counter)

### 5. "All Complete" Bonus

When all 3 daily challenges are done:
- **+25 bonus XP** (on top of per-challenge XP)
- **Visual celebration**: a brief toast/animation on Home
- **Challenge streak increments**

### 6. Challenge Streak Display

Add a small "🏅 X-day challenge streak" indicator below the challenges card on Home, visible once streak ≥ 2.

### 7. Adaptive Targets

For quantity-based challenges (sessions, cycles, minutes), scale targets based on the user's 7-day average:
- If user averages 8 min/day → "Breathe for 10 min" (slight stretch)
- If user averages 3 sessions/day → "Complete 4 sessions"
- Floor and ceiling to keep things reasonable

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/challenges.ts` | Add difficulty tiers, category tags, expanded pool (20+), adaptive targets, history tracking, challenge streak, "all complete" bonus, diversity-guaranteed picker |
| `src/pages/Home.tsx` | Add challenge streak display, "all complete" celebration toast, call history save after session |
| `src/lib/xp.ts` | Add all-complete bonus (+25 XP) to `calculateSessionXP` or as separate `addXP` call |
| `src/locales/en.ts` | Add ~15 keys for new challenge titles, streak label, completion messages |
| `src/locales/bn.ts` | Matching Bengali translations |

