

# Progressive Training + Calm Score — Implementation Plan

## Feature 1: Progressive Training System

Users start at beginner durations. As they build consistency (sessions completed per technique), phase durations gradually increase. Advanced techniques are locked until milestones are reached.

### Data Model

**`src/lib/progression.ts`** (new)

```ts
interface UserProgression {
  techniqueId: string;
  level: number;          // 1-5
  sessionsCompleted: number;
  totalCycles: number;
}
```

Stored in localStorage under `breathe_progression`.

**Leveling rules:**
- Level 1 (Beginner): Base durations (as defined in technique)
- Level 2: +1s per phase — after 5 sessions
- Level 3: +2s per phase — after 15 sessions
- Level 4: +3s per phase — after 30 sessions
- Level 5 (Master): +4s per phase — after 50 sessions

**Technique unlocking:**
- Beginner techniques: always available
- Intermediate: unlocked after 10 total sessions across any technique
- Advanced (Wim Hof): unlocked after 25 total sessions

**Functions:**
- `getProgression(techniqueId)` — returns current level and progress
- `getScaledPhases(technique, level)` — returns phases with adjusted durations
- `updateProgression(techniqueId, cycles)` — increment after session
- `getTotalSessionCount()` — for unlock checks
- `isUnlocked(technique)` — checks if difficulty tier is available

### UI Changes

**`src/pages/Session.tsx`**: Use `getScaledPhases()` instead of raw `technique.phases`. Show current level badge. After session ends, check for level-up and show celebration.

**`src/pages/Techniques.tsx`**: Show level badge on each card. Lock icon + "Complete X more sessions to unlock" for locked techniques. Progress bar toward next level.

**`src/components/TechniqueCard.tsx`**: Add level indicator and lock state.

---

## Feature 2: Calm Score (Breathing Coherence)

Measure how consistently the user follows the breathing pattern during a session. Track actual phase transition timing vs ideal timing to compute a coherence percentage.

### Data Model

**`src/lib/coherence.ts`** (new)

```ts
interface PhaseTimestamp {
  phaseIndex: number;
  expectedDuration: number;
  actualDuration: number;  // measured via timestamps
}
```

**Scoring logic:**
- Each phase transition, record actual elapsed time vs expected duration
- Deviation = `|actual - expected| / expected`
- Per-phase score = `max(0, 100 - deviation * 100)`
- Calm Score = average of all phase scores (0-100%)
- Labels: 0-40 "Building Focus", 40-70 "Good Rhythm", 70-90 "Strong Coherence", 90-100 "Deep Calm"

### Implementation

**`src/pages/Session.tsx`**: Track `Date.now()` at each phase transition in a ref array. On session end, pass timestamps to `calculateCalmScore()`.

**Session done screen**: Display the calm score as a circular progress indicator with label and color coding. Store in `SessionRecord` as `calmScore`.

**`src/lib/storage.ts`**: Add optional `calmScore: number` to `SessionRecord`.

**`src/pages/Stats.tsx`**: Add average calm score trend over time.

---

## Summary of File Changes

| File | Action |
|---|---|
| `src/lib/progression.ts` | New — leveling logic, unlock checks, scaled phases |
| `src/lib/coherence.ts` | New — calm score calculation from phase timestamps |
| `src/lib/storage.ts` | Add `calmScore` to `SessionRecord` |
| `src/pages/Session.tsx` | Track phase timestamps, use scaled phases, show level-up + calm score on done screen |
| `src/pages/Techniques.tsx` | Show levels, lock/unlock state |
| `src/components/TechniqueCard.tsx` | Add level badge, lock overlay |
| `src/pages/Stats.tsx` | Add calm score trend |
| `src/pages/Home.tsx` | Show user level in stats row |

