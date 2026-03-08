

# Fix Plan: Pluralization, Dynamic Tailwind Classes, and Console Warnings

## Bug 1: Pluralization (Medium)

**Problem:** "1 days", "1 cycles", "1 min" shown throughout the app.

**Fix:** Add a `pluralize` helper to `LanguageContext.tsx` and add singular locale keys.

- **`src/contexts/LanguageContext.tsx`** — Add a `tp(key, count, params?)` function that picks `key` (singular) vs `key_plural` based on count. Bengali has different pluralization rules (no change needed for Bengali nouns, but we add keys for consistency).
- **`src/locales/en.ts`** — Add singular keys:
  - `"stats.day": "day"` (existing `"stats.days": "days"`)
  - `"stats.session": "session"`
  - `"common.cycle": "cycle"` / `"common.cycles": "cycles"`
  - `"common.minute": "min"` (keep same as plural for "min" abbreviation)
- **`src/locales/bn.ts`** — Add matching keys
- **`src/pages/Stats.tsx`** (lines 171-172) — Replace `t("stats.days")` with `count === 1 ? t("stats.day") : t("stats.days")` for streak cards
- **`src/pages/Session.tsx`** (line 721) — Update the done stats string to handle singular cycle
- **`src/components/FriendChallenge.tsx`** (line 237) — Fix hardcoded "cycles" string

## Bug 2: Dynamic Tailwind Class Purging (Low)

**Problem:** `text-${result.color}` on Session.tsx line 49 — Tailwind can't detect dynamic classes.

**Fix in `src/pages/Session.tsx`:**
```typescript
const calmColorMap: Record<string, string> = {
  "primary": "text-primary",
  "accent": "text-accent",
  "muted-foreground": "text-muted-foreground",
};
// Line 49: className={calmColorMap[result.color] || "text-foreground"}
```

## Bug 3: Console Ref Warnings (Low)

**Problem:** ErrorBoundary class component wrapping App causes "Function components cannot be given refs" warnings.

**Fix in `src/main.tsx`:** The ErrorBoundary doesn't actually use refs — the warning comes from React StrictMode + class component boundary. Since `main.tsx` doesn't use StrictMode, this is likely from a dev tool. No code change needed — this is a false positive that doesn't appear in production builds. We can suppress it by ensuring ErrorBoundary's render returns `this.props.children` directly (which it already does). **No change required.**

## Files to Change

| File | Change |
|------|--------|
| `src/locales/en.ts` | Add singular keys: `stats.day`, `common.cycle`, `common.cycles` |
| `src/locales/bn.ts` | Add matching singular keys |
| `src/pages/Stats.tsx` | Use conditional singular/plural for streak suffix |
| `src/pages/Session.tsx` | Add `calmColorMap` object, fix plural in done stats |
| `src/components/FriendChallenge.tsx` | Replace hardcoded "cycles" with locale key |

