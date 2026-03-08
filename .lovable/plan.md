

# World-Class Onboarding for Muhurto Breath

## Concept

A 4-step full-screen onboarding flow that appears only on the user's very first visit. Once completed, a flag (`breathe_onboarding_done`) is stored in localStorage so it never shows again. The flow is smooth, animated, and bilingual from the very first screen.

## Onboarding Steps

### Step 1: Language Selection
- App logo + "Welcome to Muhurto Breath" / "মুহূর্ত ব্রেথে স্বাগতম"
- Two large, tappable cards: **English** and **বাংলা**
- Sets the language context immediately — all subsequent steps render in the chosen language

### Step 2: What This App Does (Value Proposition)
- 3 animated feature highlights (icon + short text):
  - Guided breathing techniques for calm and focus
  - Track your mood, streaks, and progress
  - Works offline — your data stays on your device
- All text uses `t()` from LanguageContext

### Step 3: Personalization (Quick Preferences)
- Choose a visual theme: Ocean, Zen, Forest, Night Sky, Neon (small theme preview circles)
- Toggle: Enable voice guidance (on/off)
- Toggle: Enable haptic feedback (on/off)
- Sets preferences via SettingsContext immediately

### Step 4: Install the App (PWA)
- Uses existing `installPrompt.ts` detection logic
- If native prompt available (Chrome/Edge): "Install" button triggers `promptInstall()`
- If manual hint needed (Safari/iOS/Firefox): Platform-specific instructions
- If already running as PWA: Skip this step entirely
- "Skip" / "Maybe Later" option always visible
- Final CTA: "Start Breathing" button → sets `breathe_onboarding_done = true` and navigates to Home

## Technical Implementation

### New Files
| File | Purpose |
|------|---------|
| `src/pages/Onboarding.tsx` | 4-step onboarding page component with internal step state |

### Modified Files
| File | Change |
|------|--------|
| `src/App.tsx` | Check `localStorage.getItem("breathe_onboarding_done")` — if not set, render `<Onboarding />` instead of `<AppInner />`. On completion, set the flag and switch to AppInner. |
| `src/locales/en.ts` | Add ~20 onboarding keys (`onboarding.welcome`, `onboarding.langSelect`, `onboarding.features.*`, `onboarding.personalize.*`, `onboarding.install.*`, `onboarding.start`) |
| `src/locales/bn.ts` | Add matching Bengali keys |

### Key Design Decisions
- **No new dependencies** — uses existing Tailwind animations, Lucide icons, and app contexts
- **Language selection on Step 1** means Steps 2-4 are fully localized in the user's chosen language
- **Theme preview** applies the theme live as user taps, so they see the effect immediately
- **Install step is conditional** — `isRunningAsPWA()` skips it; the step count adapts (3 or 4 steps)
- **Progress dots** at bottom show current step
- **Swipe/tap navigation** with "Next" and "Back" buttons
- **Data stored in localStorage** — `breathe_onboarding_done` flag, language, settings, and theme all persist through existing storage APIs

### Flow Diagram
```text
First Visit?
    │
    ├─ Yes ──► Onboarding
    │           Step 1: Language
    │           Step 2: Features
    │           Step 3: Personalize
    │           Step 4: Install (if browser)
    │           ──► Set flag ──► Home
    │
    └─ No ───► Home (normal app)
```

