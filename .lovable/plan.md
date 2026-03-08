

# Add "Guide" Knowledge Base Page

## Overview
Add a comprehensive, beautifully formatted knowledge base page accessible from the "More" menu in the bottom nav. The tab will be called **"Guide"** — a clear, meaningful name that signals it's a help/documentation resource.

## Files to Create

### `src/pages/Guide.tsx`
A single-page knowledge base using Accordion components for organized, collapsible sections. Content covers every feature of the app with proper formatting, icons, and structure.

**Sections:**
1. **Getting Started** — What is Muhurto Breath, first session walkthrough, installing the PWA
2. **Breathing Techniques** — Overview of all 5 preset techniques (Box Breathing, 4-7-8, Calm Breath, Equal Breathing, Wim Hof), when to use each, difficulty levels, phase patterns
3. **Sessions** — How sessions work, phases, cycle counting, pause/resume, Zen Mode, voice guidance, ambient soundscapes, breathing detection (mic), heart rate monitor (camera)
4. **Custom Techniques** — How to create custom techniques, pyramid mode explanation, editing/deleting
5. **Playlists** — Chaining techniques into multi-step sessions
6. **Guided Programs** — 7-Day Stress Relief, Sleep Better in 14 Days, Focus Training — structure, enrollment, daily tips
7. **Progress & Stats** — XP system (levels, titles, breakdown), streaks, calm score calculation, mood tracking, badges (all 15 listed with unlock criteria), daily challenges, weekly consistency, insights
8. **Keyboard Shortcuts** — Full shortcut reference
9. **Data & Privacy** — All data stored locally, export/import JSON, CSV export, no account needed, offline support
10. **Accessibility** — High contrast, large text, reduced motion
11. **FAQ** — Common questions: "Is it free?", "Does it work offline?", "How is calm score calculated?", "Can I share with friends?" (friend challenges)

**Design:** Uses `Accordion` for each major section, with clear headings, descriptive text, inline code/badges for key terms, and tables where appropriate (e.g., technique comparison, badge list). Styled consistently with the app's existing card/border/muted-foreground patterns.

## Files to Modify

### `src/components/BottomNav.tsx`
Add `{ path: "/guide", labelKey: "nav.guide" }` to `MORE_ITEMS`.

### `src/App.tsx`
- Import `Guide` page
- Add `<Route path="/guide" element={<Guide />} />`

### `src/locales/en.ts`
Add `"nav.guide": "Guide"` and a few section header translations.

### `src/locales/bn.ts`
Add `"nav.guide": "গাইড"` (Bengali translation).

## Technical Notes
- No new dependencies — uses existing Accordion, Card, Badge, Separator components
- Content is hardcoded (no CMS) — appropriate for a static knowledge base
- Page scrolls with bottom padding for nav bar clearance
- Fully responsive, works on mobile and desktop

