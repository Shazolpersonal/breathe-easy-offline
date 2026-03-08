

# Language Toggle in Home Header

## What
Add a compact, polished language toggle button on the right side of the header row (next to "Muhurto Breath"), allowing users to switch between English and বাংলা with a single tap.

## Design
A small pill-shaped toggle showing the two language codes side by side (`EN | বাং`), with the active one highlighted. Tapping swaps the language instantly via `useLanguage().setLanguage()`.

```text
[🪷 logo] Muhurto Breath          [EN | বাং]
Good Morning — take a muhurto...
```

## Implementation

**File: `src/pages/Home.tsx`**
- Change the header `div` (line 79) to `justify-between` so logo+title sit left and the toggle sits right.
- Add a language toggle button on the right side — a small rounded pill with two segments. The active language gets `bg-primary text-primary-foreground`, inactive gets `text-muted-foreground`.
- Clicking either segment calls `setLanguage("en")` or `setLanguage("bn")`.

The toggle will be ~60px wide, rounded-full, with a subtle border, fitting the app's existing card/rounded aesthetic. No new files or dependencies needed — just a few lines added to the header JSX.

