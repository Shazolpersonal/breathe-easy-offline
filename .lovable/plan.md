

# Breathing Timer — Root Cause Analysis & Fix Plan

## The Problem

The `tick` function has **nested `setState` calls 3 levels deep** — this is undefined behavior in React and causes unreliable second counting.

Here's what the code does on every tick:

```text
setSecondsLeft((prev) => {           ← Level 1: updater
  if (prev <= 1) {
    setPhaseIndex((pi) => {          ← Level 2: setState inside updater
      setSecondsLeft(nextPhase.duration); ← Level 3: SAME state variable!
      setCompletedCycles(...)        
      return next;
    });
    return prev;                     ← Returns 1 (stale)
  }
  return prev - 1;
});
```

**Why this breaks:**
1. `setSecondsLeft` is called **inside its own updater** — React does not guarantee this works. The inner call may be ignored, delayed, or processed out of order.
2. The outer updater returns `prev` (1), then the inner set tries to overwrite with `nextPhase.duration`. In some React batching scenarios, the final value is 1 instead of the next phase's duration — causing the countdown to show "1" for an extra tick, or skip numbers.
3. `setPhaseIndex` inside `setSecondsLeft` means phase state and seconds state update in unpredictable order.

**Visible symptoms:** Countdown numbers stutter, show duplicate values (e.g., 4→3→2→1→1→4), or phases feel too fast/slow.

---

## Fix: Restructure `tick` to use refs + single top-level setState calls

Instead of nesting setState, use refs to track `secondsLeft` and `phaseIndex` synchronously, then call setState once at the end:

```text
tick():
  1. Read secondsLeftRef, phaseIndexRef (current values, no closures)
  2. Decrement secondsLeft
  3. If secondsLeft reaches 0 → compute next phase, update all refs
  4. Call each setState ONCE at the top level (no nesting):
     - setSecondsLeft(newValue)
     - setPhaseIndex(newIndex)  
     - setCompletedCycles(newCycles)
     - setTotalElapsed(te => te + 1)
```

### Files to change

**`src/pages/Session.tsx`** — Rewrite the `tick` function:
- Read `secondsLeftRef.current` and `phaseIndexRef.current` instead of using updater functions
- Compute the next state synchronously using refs
- Update refs immediately
- Call flat (non-nested) setState calls for each piece of state
- This eliminates all nested setState and makes the countdown deterministic

The timer `useEffect` and `start`/`pause`/`resume` functions remain unchanged.

