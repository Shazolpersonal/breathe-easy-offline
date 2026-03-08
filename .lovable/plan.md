

# Add Bangla Language Support to Guide Page

## Overview
The Guide page currently has all content hardcoded in English (~628 lines). We need to extract every text string into translation keys and add Bengali translations to the locale files.

## Approach
- Import `useLanguage` in `Guide.tsx` and replace all hardcoded English strings with `t("guide.xxx")` calls
- Add ~120+ new translation keys to `src/locales/en.ts` with the existing English text
- Add corresponding Bengali translations to `src/locales/bn.ts`

## Files to Modify

### `src/pages/Guide.tsx`
- Import `useLanguage` hook
- Call `const { t } = useLanguage()` at the top of the component and sub-components that need it
- Replace every hardcoded string (headings, descriptions, table data, FAQ Q&A, badge names/criteria, XP labels, shortcut descriptions, etc.) with `t()` calls
- Pass `t` to sub-components (`TechniqueTable`, `BadgeTable`, `XPLevelTable`, `InfoBlock`) as needed, or use the hook directly

### `src/locales/en.ts`
Add ~120 new keys under a `guide.*` namespace covering:
- Section titles, subtitles, header/footer
- Getting Started content (3 paragraphs + list items)
- Technique table rows (names, patterns, difficulty, best-for)
- Session features (Zen Mode, Voice, Soundscapes, Breathing Detection, Heart Rate, Calm Score, Visualizations)
- Custom Techniques steps + Pyramid explanation
- Playlists instructions
- Programs descriptions (3 programs)
- Progress section (XP breakdown labels/values, level titles, streaks, mood, challenges, consistency, insights, badge names/criteria)
- Keyboard shortcuts (actions for global + session)
- Data & Privacy (4 info blocks + footer text)
- Accessibility (3 options + descriptions)
- FAQ (8 questions + answers)
- Footer text

### `src/locales/bn.ts`
Add matching Bengali translations for all ~120 keys. Full professional Bengali translations covering all the same content.

## Scale
This is a large but mechanical change — every visible string becomes a `t()` call with corresponding entries in both locale files. No structural or logic changes to the page.

