

# Gamification & Motivation — Achievement Badges, Daily Challenges, XP & Levels

## Overview

Three interconnected gamification systems, all localStorage-based, zero cost. They share data from existing `SessionRecord`s and `UserProgression`.

---

## 1. Achievement Badges

**`src/lib/achievements.ts`** (new)

Define ~15 badges, each with an `id`, `name`, `emoji`, `description`, and a `check(context)` function that evaluates unlock status from existing data.

Badge examples:
- **First Breath** — Complete 1 session
- **Week Warrior** — 7-day streak
- **Night Owl** — Session after 11pm
- **Early Bird** — Session before 7am
- **Century** — 100 total minutes
- **Marathon** — Single session ≥ 10 min
- **Creator** — Created a custom technique
- **Zen Master** — Reach Level 5 on any technique
- **Calm Mind** — Calm score ≥ 90
- **Explorer** — Try 3 different techniques
- **Consistent** — 30-day streak
- **Deep Diver** — 50 total sessions
- **Mood Lifter** — Mood improvement of +3 in one session
- **Dedicated** — 500 total minutes
- **Perfect Week** — 7 consecutive days with ≥ 5 min each

Functions: `checkAllBadges()` returns `{ unlocked: Badge[], locked: Badge[] }`. `getNewlyUnlocked()` compares against a stored "seen" list to detect new unlocks and trigger toasts.

**`src/pages/Achievements.tsx`** (new) — Full-page badge gallery with unlocked (color) vs locked (grayscale) display. Add route `/achievements`.

**`src/components/BottomNav.tsx`** — Add a 6th nav item (Trophy icon) for Achievements, or nest it under Stats. Better: add it as a tab inside Stats page to keep nav clean.

**`src/pages/Session.tsx`** — After session ends, call `getNewlyUnlocked()` and show toast/banner for any new badges.

---

## 2. Daily Challenges

**`src/lib/challenges.ts`** (new)

Define a pool of ~10 challenge templates:
- "Try a new technique today"
- "Complete 3 sessions"
- "Breathe for 10 minutes total"
- "Achieve a calm score above 80"
- "Do a session before 8am"
- "Try a session longer than 5 minutes"
- "Complete 5 cycles in one session"
- "Improve your mood by 2+ points"

**Date-seeded selection**: Use `new Date().toISOString().split('T')[0]` as seed → simple hash → pick 2-3 challenges per day deterministically (same challenges for the whole day, changes at midnight).

**Progress tracking**: `getDailyChallengeProgress()` checks today's sessions against each active challenge's criteria. Store completed challenge dates in localStorage to prevent re-triggering.

**UI**: Show daily challenges as a card on the Home page below the SmartSuggestion. Each challenge shows progress (e.g., "2/3 sessions") and a checkmark when complete. Completing all daily challenges could award bonus XP.

---

## 3. XP & Levels System

**`src/lib/xp.ts`** (new)

XP sources per session:
- Base: 10 XP per session
- Duration bonus: +1 XP per minute
- Difficulty multiplier: beginner ×1, intermediate ×1.5, advanced ×2
- Calm score bonus: +5 XP if score ≥ 80
- Daily challenge completion: +15 XP per challenge
- Streak bonus: +2 XP × current streak day

**Level thresholds** (exponential curve):
- Lv 1: 0 XP — "Beginner Breather"
- Lv 2: 50 XP — "Mindful Starter"
- Lv 3: 150 XP — "Breath Apprentice"  
- Lv 4: 350 XP — "Calm Practitioner"
- Lv 5: 600 XP — "Focus Adept"
- Lv 6: 1000 XP — "Serenity Seeker"
- Lv 7: 1500 XP — "Breath Master"
- Lv 8: 2200 XP — "Calm Master"
- Lv 9: 3000 XP — "Zen Sage"
- Lv 10: 4000 XP — "Enlightened"

Functions: `addXP(amount)`, `getXPState() → { totalXP, level, title, progressToNext }`, `calculateSessionXP(session, calmScore, challengesCompleted)`.

Store `{ totalXP: number, history: { date, amount, reason }[] }` in localStorage.

**UI on Home page**: Replace or enhance the "Sessions" stat card with an XP level display showing current level title and progress bar to next level. Show XP earned on the session done screen alongside calm score.

---

## File Change Summary

| File | Action |
|---|---|
| `src/lib/achievements.ts` | New — badge definitions + check logic |
| `src/lib/challenges.ts` | New — daily challenge pool, date-seed selection, progress tracking |
| `src/lib/xp.ts` | New — XP calculation, level system, localStorage persistence |
| `src/pages/Session.tsx` | Show XP earned + new badge toasts on done screen |
| `src/pages/Home.tsx` | Add daily challenges card, XP level display in stats row |
| `src/pages/Stats.tsx` | Add Achievements tab with badge gallery |
| `src/components/BottomNav.tsx` | No change (badges live inside Stats) |
| `src/App.tsx` | No new routes needed (badges in Stats tab) |

