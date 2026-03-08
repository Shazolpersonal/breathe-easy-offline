

# Techniques Library — Real User Audit Report

## Testing Scope
Complete walkthrough of the Techniques page (listing, favorites, custom creation, pyramid mode) and TechniqueCard component (display, progression, unlock gating, navigation to session). Also reviewed supporting libraries: `techniques.ts`, `progression.ts`, `storage.ts`.

---

## Issues Found

### BUG 1 — HIGH: No way to delete or edit custom techniques

`deleteCustomTechnique()` exists in `storage.ts` (line 177) but is **never imported or called anywhere**. Once a user creates a custom technique, it stays forever. There is no edit button, no delete button, no swipe-to-delete — nothing. If a user makes a typo or creates a test technique, they are stuck with it permanently.

**File**: `src/pages/Techniques.tsx` — missing delete/edit UI
**Expected**: Custom technique cards should show a delete button (and ideally edit). Preset techniques should not be deletable.

---

### BUG 2 — HIGH: Custom technique phase labels are baked-in at creation time with current language

**File**: `src/pages/Techniques.tsx` lines 36-39

When creating a custom technique, the phase `label` is set to `t("phase.inhale")`, `t("phase.hold")`, etc. — the **translated string at creation time**. This string is stored in localStorage. If the user later switches language, all custom technique phase labels remain in the original creation language (e.g., Bengali labels showing in an English UI).

**Expected**: Store phase type keys, not translated labels. Resolve labels at render time using `t()`.

---

### BUG 3 — MEDIUM: Custom technique fallback name is hardcoded English

**File**: `src/pages/Techniques.tsx` line 30

`form.name || "Custom Technique"` — if a user leaves the name blank while using Bengali, the technique is saved as "Custom Technique" in English.

**Expected**: Use `t("techniques.customDefault")` or similar locale key as fallback.

---

### BUG 4 — MEDIUM: No input validation on custom technique creation

**File**: `src/pages/Techniques.tsx` lines 27-48

- User can type `inhale = 0` (min=1 in HTML but `+e.target.value` doesn't enforce it programmatically)
- User can type negative numbers via keyboard
- Pyramid start multiplier can be set to 0 or negative
- `pyramidConfig.steps = 1` causes division by zero in `getPyramidPhasesForRound` (line 106 of techniques.ts: `steps > 1 ? mirroredPos / (steps - 1)` — safe due to ternary, but `steps = 1` produces `totalCycleLen = 1`, meaning only 1 round ever, which may confuse users)
- No max name length — user can type a 500-character name that breaks card layout

**Expected**: Validate before saving. Clamp values. Show inline errors.

---

### BUG 5 — MEDIUM: `isUnlocked()` and `getProgression()` re-parse localStorage on every TechniqueCard render

**File**: `src/components/TechniqueCard.tsx` lines 27-28

Each TechniqueCard calls `isUnlocked(technique)` which calls `getTotalSessionCount()` → `getAllProgressions()` → `localStorage.getItem` + `JSON.parse`. And `getProgression(technique.id)` does the same. With 5 preset + N custom techniques, that's **2×(5+N) localStorage parses** on every render of the Techniques page. No memoization.

**Expected**: Compute unlock status and progressions once in the parent (`Techniques.tsx`) and pass as props, or use `useMemo`.

---

### BUG 6 — MEDIUM: No filtering, sorting, or search on the Techniques page

**File**: `src/pages/Techniques.tsx` lines 139-148

All techniques are listed in a flat list: presets first, then custom. No way to:
- Filter by difficulty (beginner/intermediate/advanced)
- Filter by favorites only
- Search by name
- Sort by cycle duration, level, or recently used

For a user with 10+ custom techniques, finding the right one is tedious scrolling.

**Expected**: At minimum, a difficulty filter or favorites-first sorting.

---

### BUG 7 — LOW: `"Lv."` prefix is hardcoded English in TechniqueCard

**File**: `src/components/TechniqueCard.tsx` lines 58, 76

Both compact and full card views use hardcoded `Lv.{progression.level}`. Bengali users see mixed-language text like "৪-৭-৮ রিল্যাক্সেশন · 19s · Lv.1".

**Expected**: Use a locale key like `t("common.level", { level: progression.level })`.

---

### BUG 8 — LOW: Pyramid preview only shows inhale durations, not the full cycle

**File**: `src/pages/Techniques.tsx` line 57

`pyramidPreview` computes `Math.round(form.inhale * mult)` — only showing the inhale phase scaling. If the user set hold and exhale phases too, they have no idea how those scale. This is misleading for techniques with 3-4 phases.

**Expected**: Show the full cycle duration per step, or at least mention that all phases scale proportionally.

---

### BUG 9 — LOW: Custom technique description and benefit are generic and not editable

**File**: `src/pages/Techniques.tsx` lines 31-32

Every custom technique gets `t("techniques.customDescription")` ("Your custom breathing pattern.") and a single benefit `t("techniques.personalizedBenefit")` ("Personalized"). The user cannot write their own description or benefits. This makes all custom techniques look identical in their description area.

**Expected**: Add optional description and benefit fields to the creation dialog.

---

## Summary Table

| # | Severity | Issue | User Impact |
|---|----------|-------|-------------|
| 1 | HIGH | No delete/edit for custom techniques | Stuck with mistakes forever |
| 2 | HIGH | Phase labels baked in with creation-time language | Mixed languages after switching |
| 3 | MEDIUM | Fallback name hardcoded English | "Custom Technique" in Bengali UI |
| 4 | MEDIUM | No input validation on creation form | Invalid/broken techniques possible |
| 5 | MEDIUM | localStorage parsed per-card on every render | Performance degrades with more techniques |
| 6 | MEDIUM | No filtering/sorting/search | Hard to find techniques in long lists |
| 7 | LOW | "Lv." hardcoded English | Mixed language in Bengali mode |
| 8 | LOW | Pyramid preview only shows inhale | Misleading for multi-phase techniques |
| 9 | LOW | Description/benefits not editable | All custom techniques look the same |

---

## Recommendation

**Priority 1** — Fix #1 and #2: These are the most impactful. Users cannot manage their custom techniques at all (no delete), and the language-baked labels are a data corruption issue that gets worse over time.

**Priority 2** — Fix #3, #4, #5: Quick wins — localize the fallback name, add basic validation, and memoize the progression/unlock calls.

**Priority 3** — Fix #6, #7, #8, #9: UX polish that improves the experience for power users with many techniques.

