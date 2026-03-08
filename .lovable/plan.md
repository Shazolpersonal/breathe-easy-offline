

# Bengali (বাংলা) Language Toggle — Full Bilingual i18n

## Overview

A zero-dependency i18n system with a `LanguageContext`, a `t()` hook, and two flat JSON-like translation maps (EN/BN). Every user-facing string across all pages, components, and data modules gets a translation key.

## Architecture

```text
LanguageContext (React Context)
  ├── language: "en" | "bn"
  ├── setLanguage()
  └── t(key, params?) → string

src/locales/en.ts  ─── flat key-value map (~300+ keys)
src/locales/bn.ts  ─── same keys, Bengali values
```

**Why `.ts` not `.json`?** Allows template interpolation helpers and type-safe keys.

---

## Key Design Decisions

1. **Flat key namespace**: `"home.greeting.morning"`, `"technique.box-breathing.name"`, `"session.done.title"`, etc.
2. **Interpolation**: Simple `{{variable}}` replacement — `t("stats.report.summary", { minutes: 240, sessions: 48 })` → "You breathed 240 minutes across 48 sessions"
3. **Data-driven strings** (techniques, programs, achievements, challenges, moods, XP levels): All translated via keys derived from their IDs, e.g. `technique.box-breathing.name`, `program.stress-relief-7.description`, `badge.first-breath.name`
4. **Voice guidance**: When language is Bengali, the `speak()` function picks a `bn` voice if available, otherwise falls back to English
5. **Language persisted** in localStorage as `breathe_language`
6. **Settings toggle**: Simple EN/BN switcher at the top of Settings page

---

## File Changes

| File | Action |
|---|---|
| `src/locales/en.ts` | New — English translation map |
| `src/locales/bn.ts` | New — Bengali translation map |
| `src/contexts/LanguageContext.tsx` | New — context + `useLanguage` hook with `t()` |
| `src/App.tsx` | Wrap with `LanguageProvider` |
| `src/pages/Home.tsx` | Replace all hardcoded strings with `t()` |
| `src/pages/Session.tsx` | Replace all strings (phase labels, done screen, buttons, mood labels) |
| `src/pages/Techniques.tsx` | Replace strings (header, dialog labels, form labels) |
| `src/pages/Stats.tsx` | Replace tab labels, stat labels, chart labels, report text |
| `src/pages/Settings.tsx` | Add language toggle + replace all strings |
| `src/pages/Playlists.tsx` | Replace strings |
| `src/pages/Programs.tsx` | Replace strings |
| `src/components/BottomNav.tsx` | Replace nav labels |
| `src/components/SmartSuggestion.tsx` | Replace suggestion messages |
| `src/components/TechniqueCard.tsx` | Replace UI strings (difficulty, buttons) |
| `src/components/MoodPicker.tsx` | Mood labels via `t()` |
| `src/lib/techniques.ts` | Phase labels, names, descriptions via translation keys |
| `src/lib/programs.ts` | Program names, descriptions, tips via keys |
| `src/lib/achievements.ts` | Badge names, descriptions via keys |
| `src/lib/challenges.ts` | Challenge titles via keys |
| `src/lib/suggestions.ts` | Suggestion messages via keys |
| `src/lib/mood.ts` | Mood labels via keys |
| `src/lib/xp.ts` | XP level titles via keys |
| `src/lib/shareCard.ts` | Card text via keys |
| `src/lib/reminders.ts` | Default reminder message via key |
| `src/lib/voice.ts` | Language-aware voice selection |

---

## Translation Strategy for Data Modules

For modules like `techniques.ts` that export constant arrays with `name`, `description`, `benefits`:
- Keep the data structures as-is (they serve as IDs/defaults)
- Components that display them call `t(`technique.${id}.name`)` instead of using `.name` directly
- This avoids restructuring all data, and keeps the i18n layer clean

For phase labels like "Breathe In", "Hold", "Breathe Out":
- Use `t(`phase.${type}`)` where type is `inhale | hold | exhale | hold-after-exhale`
- Voice guidance also uses the translated phase label

---

## Translation Key Categories (~300+ keys)

- **Navigation**: `nav.home`, `nav.breathe`, `nav.library`, `nav.stats`, `nav.more`, `nav.playlists`, `nav.programs`, `nav.settings`
- **Home**: `home.greeting.*`, `home.dayStreak`, `home.minToday`, `home.dailyChallenges`, `home.quickStart`, `home.tapToBreathe`, `home.xpToNext`
- **Session**: `session.ready`, `session.start`, `session.pause`, `session.resume`, `session.stop`, `session.done.*`, `session.journal.placeholder`, `session.share`, `session.again`, `session.moodAfter`, `session.calmScore`, `session.levelUp`, `session.nextUp`, `session.continue`
- **Phases**: `phase.inhale`, `phase.hold`, `phase.exhale`, `phase.holdAfterExhale`
- **Techniques**: `technique.{id}.name`, `technique.{id}.description`, `technique.{id}.benefits.*`
- **Stats**: `stats.title`, `stats.overview`, `stats.badges`, `stats.journal`, `stats.reports`, `stats.currentStreak`, `stats.longestStreak`, `stats.totalTime`, `stats.sessions`, `stats.avgCalm`, `stats.thisWeek`, `stats.timeOfDay`, `stats.calmTrend`, `stats.last30`, `stats.report.*`
- **Settings**: `settings.title`, `settings.theme`, `settings.language`, `settings.voice.*`, `settings.general.*`, `settings.visualization`, `settings.reminders.*`, `settings.data.*`, `settings.install.*`
- **Programs**: `program.{id}.name`, `program.{id}.description`, `program.{id}.day{n}.tip`
- **Badges**: `badge.{id}.name`, `badge.{id}.description`
- **Challenges**: `challenge.{id}.title`
- **Moods**: `mood.stressed`, `mood.anxious`, `mood.neutral`, `mood.good`, `mood.calm`
- **XP**: `xp.{title}`
- **Playlists**: `playlists.title`, `playlists.new`, `playlists.empty`, `playlists.edit`, etc.
- **Misc**: `common.min`, `common.days`, `common.sessions`, `common.cycles`

---

## Execution Order

1. Create `LanguageContext` + locales (en.ts, bn.ts)
2. Wrap App with provider
3. Update all pages and components (largest task — methodical, file by file)
4. Update data modules to work with translation keys
5. Update voice.ts for Bengali voice selection
6. Add language toggle in Settings

