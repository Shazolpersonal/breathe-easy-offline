

# Accessibility Mode — High Contrast, Larger Text, Screen-Reader Labels, Reduced Motion

## Overview

Add three toggleable accessibility settings that apply globally via CSS data-attributes and ARIA improvements across the app.

## Settings

Add three new fields to `AppSettings` in `src/lib/storage.ts`:
- `highContrast: boolean` (default `false`)
- `largeText: boolean` (default `false`)
- `reducedMotion: boolean` (default `false`)

## Implementation

### 1. Data Attribute Application (`src/App.tsx`)

Read accessibility settings from `useSettings()` and apply `data-high-contrast`, `data-large-text`, `data-reduced-motion` attributes on the root `<div>` or `document.documentElement`. This allows pure CSS targeting.

### 2. CSS Layer (`src/index.css`)

**High Contrast** — Override CSS variables when `[data-high-contrast="true"]`:
- Increase foreground lightness to 98%+
- Increase border contrast (lighter borders)
- Boost primary/accent saturation
- Card backgrounds slightly lighter for separation

**Large Text** — When `[data-large-text="true"]`:
- Scale base font size up (`html { font-size: 18px }` or `1.125rem`)
- Increase line-height slightly for readability

**Reduced Motion** — When `[data-reduced-motion="true"]`:
- `* { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }`
- This kills all breathing animations, particle effects, and transitions
- The breathing visualizer still shows phase state (scale changes apply instantly)

### 3. Settings UI (`src/pages/Settings.tsx`)

Add a new "Accessibility" section with three `Switch` toggles:
- High Contrast
- Large Text
- Reduced Motion

### 4. ARIA & Screen-Reader Improvements

Across key components, add proper `aria-label`, `role`, and `aria-live` attributes:
- **`BreathingVisualizer`/`BreathingCircle`**: `aria-live="polite"` on the phase label so screen readers announce phase changes
- **`BottomNav`**: `role="navigation"`, `aria-label` on nav links
- **`MoodPicker`**: `role="radiogroup"` with `aria-label` on each mood button
- **`Session.tsx`**: `aria-live="assertive"` on timer/countdown display
- **Buttons throughout**: Ensure icon-only buttons have `aria-label` (e.g., delete, share buttons)

### 5. Translation Keys

Add ~10 keys to both `en.ts` and `bn.ts`:
- `settings.accessibility`, `settings.highContrast`, `settings.largeText`, `settings.reducedMotion` + descriptions

## File Changes

| File | Action |
|---|---|
| `src/lib/storage.ts` | Add 3 fields to `AppSettings` + defaults |
| `src/index.css` | Add high-contrast, large-text, reduced-motion CSS rules |
| `src/App.tsx` | Apply data attributes from settings |
| `src/pages/Settings.tsx` | Add Accessibility section |
| `src/locales/en.ts` | Add accessibility translation keys |
| `src/locales/bn.ts` | Add accessibility translation keys |
| `src/components/BreathingCircle.tsx` | Add `aria-live` on phase label |
| `src/components/BottomNav.tsx` | Add `role="navigation"`, `aria-label` |
| `src/components/MoodPicker.tsx` | Add `role="radiogroup"`, `aria-label` |
| `src/pages/Session.tsx` | Add `aria-live` on timer |

