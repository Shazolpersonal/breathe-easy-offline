

# Redesign the "More" Menu Popup

## Problem
The "More" menu popup is positioned with `bottom-16 right-4` and `z-40`, while the bottom nav is `z-50`. This causes the bottom items (especially "Settings") to be obscured by the nav bar. The menu also lacks visual polish.

## Solution
Redesign the popup menu with:

### Positioning Fix
- Change from `z-40` overlay to `z-[60]` so the menu renders above the nav bar
- Position the menu with `bottom-20` (instead of `bottom-16`) to give proper clearance above the nav, accounting for safe-area padding
- Add `right-2` with `min-w-[180px]` for consistent sizing

### Visual Upgrade
- Add icons to each menu item (ListMusic for Playlists, GraduationCap for Programs, BookOpen for Guide, Settings icon for Settings)
- Add a subtle entrance animation (scale + fade in via Tailwind `animate-in`)
- Use a glass-morphism card style: `bg-card/90 backdrop-blur-xl` with a stronger border and shadow
- Active item gets a left accent bar + primary color highlight
- Add a small caret/triangle pointing down toward the "More" button
- Increase touch targets with `py-3 px-4` padding
- Add item separators with subtle dividers

### File Changes
**`src/components/BottomNav.tsx`** — Single file change:
- Import additional icons (ListMusic, GraduationCap, BookOpenText, Settings2)
- Add icons to `MORE_ITEMS` array
- Redesign the popup container: higher z-index, better positioning, glass effect, entrance animation
- Redesign each menu button: icon + label layout, active accent bar, larger touch targets
- Add a downward-pointing caret triangle anchored to the popup bottom

