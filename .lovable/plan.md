

# Breathing Exercise App — PWA Plan

Since Lovable builds web apps with React + Vite + Tailwind CSS, we'll build this as a **Progressive Web App (PWA)** that can be installed on any phone from the browser, works fully offline, and feels like a native app.

---

## What You Get

- **Installable on phone** — Add to home screen, launches like a real app with splash screen
- **100% offline** — All features work without internet, including voice guidance (pre-bundled audio)
- **Rich animations** — Smooth breathing circle/orb animations using CSS
- **Multiple techniques** — Box Breathing, 4-7-8, Wim Hof, Calm Breath, custom patterns
- **Themes** — Zen, Ocean, Forest, Night Sky, Neon Dark — user switchable
- **Voice guidance** — Using the browser's built-in Speech Synthesis API (no audio files or internet needed)
- **Smart suggestions** — Time-of-day and mood-based technique recommendations (all local logic)
- **Session tracking** — Stats stored in localStorage (streaks, total minutes, history)

---

## Pages & Features

### 1. Home / Dashboard
- Greeting based on time of day
- Smart suggestion card ("Good evening — try 4-7-8 for better sleep")
- Quick-start buttons for favorite techniques
- Streak counter and today's minutes

### 2. Breathing Session Screen
- Large animated breathing circle (inhale expands, exhale contracts)
- Phase indicator (Inhale / Hold / Exhale / Hold)
- Timer countdown per phase
- Haptic feedback via Vibration API
- Voice guidance toggle (uses `speechSynthesis` — no internet needed)
- Pause / Stop controls
- Session duration selector

### 3. Techniques Library
- Preset techniques: Box Breathing, 4-7-8, Wim Hof, Calm Breath, Equal Breathing
- Each with description, benefits, difficulty level
- Custom technique builder (set inhale/hold/exhale/hold durations)
- Save custom techniques to localStorage

### 4. Statistics
- Calendar heatmap of practice days
- Total sessions, total minutes, current streak, longest streak
- Weekly/monthly charts using Recharts
- All data in localStorage

### 5. Settings & Themes
- Theme switcher (Zen, Ocean, Forest, Night Sky, Neon)
- Voice guidance settings (on/off, speed, voice selection)
- Vibration toggle
- Default session duration
- Sound effects toggle
- Export/import data (JSON)

### 6. Install Page
- Instructions to install PWA on Android/iOS
- Install prompt trigger for supported browsers

---

## Technical Approach

| Concern | Solution |
|---|---|
| Offline | vite-plugin-pwa with service worker caching all assets |
| Voice guidance | Browser `speechSynthesis` API — zero network, works offline |
| Data storage | localStorage for settings, sessions, custom techniques |
| Animations | CSS keyframes + React state for breathing circle |
| Haptics | Navigator Vibration API |
| Charts | Recharts (already installed) |
| Themes | CSS variables swapped via React context |
| Smart suggestions | Simple time-of-day + usage pattern logic |

## File Structure

```text
src/
├── pages/
│   ├── Home.tsx
│   ├── Session.tsx
│   ├── Techniques.tsx
│   ├── Stats.tsx
│   ├── Settings.tsx
│   └── Install.tsx
├── components/
│   ├── BreathingCircle.tsx
│   ├── PhaseIndicator.tsx
│   ├── TechniqueCard.tsx
│   ├── SmartSuggestion.tsx
│   ├── SessionControls.tsx
│   ├── StatsCalendar.tsx
│   ├── CustomTechniqueBuilder.tsx
│   └── BottomNav.tsx
├── contexts/
│   ├── ThemeContext.tsx
│   └── SettingsContext.tsx
├── lib/
│   ├── techniques.ts        (preset data)
│   ├── voice.ts             (speechSynthesis wrapper)
│   ├── storage.ts           (localStorage helpers)
│   ├── suggestions.ts       (smart suggestion logic)
│   └── haptics.ts           (vibration wrapper)
└── index.css                (theme variables)
```

This will be built incrementally — core breathing session first, then techniques, then themes/stats/suggestions.

