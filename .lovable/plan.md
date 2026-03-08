

# UI Issues — Deep Analysis & Fix Plan

## Issues Identified from Screenshot & Code

### 1. XP Breakdown Box — Text Unreadable (Critical)
The XP box uses `bg-accent/50` as its background. Across themes:
- **Neon**: accent is bright cyan (`170 85% 50%`) — the `text-muted-foreground` labels (designed for dark backgrounds) become invisible against this semi-transparent bright color
- **Ocean**: accent is teal — same contrast problem
- **Forest**: accent is lime-green — same problem

The label text (`text-muted-foreground`) has no contrast against the bright accent background. The box is also too narrow (`max-w-[220px]`) for Bengali text which is wider than English.

**Fix**: Replace `bg-accent/50` with `bg-card border border-border` (the same pattern used for every other card on the done screen). Widen to `max-w-xs` (320px). This guarantees readability across all themes because `card` and `card-foreground` are always designed as a high-contrast pair.

### 2. Done Screen — No Scroll on Small Screens
The done screen uses `min-h-screen flex items-center justify-center` with no scroll container. On phones with many elements shown (XP + calm score + mood + journal + buttons), content overflows below the viewport with no way to scroll.

**Fix**: Change to `min-h-screen overflow-y-auto` and add `py-8` top padding so content flows naturally.

### 3. Button Row — Wraps Awkwardly on Mobile
Four buttons ("Share", "Invite", "Again", "Done") in a `flex-wrap` row. On narrow phones, they wrap into 2+2 or 3+1 patterns that look unbalanced, especially with Bengali text which is wider.

**Fix**: Stack buttons into a `flex-col` layout on mobile with `w-full max-w-xs` so each button gets its own row. Group primary actions (Again, Done) together and secondary actions (Share, Invite) together.

### 4. Calm Score Ring — Small Touch Target
The calm score display at 80x80px is fine visually but could be larger for the done screen context.

**Fix**: No change needed — this is acceptable.

### 5. Mood Picker — Emoji Row Overflow on Small Screens
5 mood buttons in a horizontal row with padding can overflow on phones < 360px wide.

**Fix**: Add `flex-wrap` to the mood picker row as a safety net.

### 6. Journal Textarea — Low Contrast Placeholder
`bg-secondary/50` can produce low-contrast placeholders on some themes.

**Fix**: Use `bg-card` instead for consistency.

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Session.tsx` | Fix XP box background/width, fix done screen scrolling, restructure button layout, fix journal textarea bg |
| `src/components/MoodPicker.tsx` | Add `flex-wrap` safety to emoji row |

### Technical Notes
- All fixes use existing theme CSS variables (`bg-card`, `border-border`, `text-foreground`) which are guaranteed to have proper contrast across all 5 themes + night warmth + high contrast mode
- Zero new dependencies, zero storage changes
- Fixes are purely CSS/className changes — no logic changes

