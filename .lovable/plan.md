

# Voice System — Deep Analysis & World-Class Enhancement Plan

## Current State

### How It Works Today
The entire voice system is **29 lines** in `src/lib/voice.ts`. It uses the browser's built-in `window.speechSynthesis` (Web Speech API) — completely free, no server, no API key, works offline forever.

### What It Does
- Speaks **only 4 phrases** during a session: "Breathe In", "Hold", "Breathe Out", "Hold" (phase transitions)
- Hardcoded to prefer any voice with "female" in its name
- Pitch locked at 0.95, volume at 0.8
- Settings expose only 2 controls: on/off toggle and speed slider

### Weaknesses

| # | Problem |
|---|---------|
| 1 | **No voice selection** — User cannot choose which voice. Hardcoded "female" preference. |
| 2 | **No pitch/tone control** — Pitch is fixed at 0.95. No way to make it deeper or higher. |
| 3 | **No voice preview** — User can't hear what a voice sounds like before selecting it. |
| 4 | **Only phase names spoken** — No countdown, no encouragement, no session start/end announcements. |
| 5 | **No breathing count** — Many users want "1... 2... 3..." counted during inhale/exhale. |
| 6 | **No motivational cues** — No mid-session encouragement ("You're doing great", "Halfway there"). |
| 7 | **No session announcements** — No "Session starting" or "Session complete, well done." |
| 8 | **No cycle milestone announcements** — No "Cycle 5 complete" feedback. |
| 9 | **Voice breaks on some devices** — `getVoices()` returns empty on first call (async loading issue). No retry logic. |
| 10 | **Bengali voice often missing** — Many devices have no `bn` voice. No fallback messaging to user. |

---

## Enhancement Plan

### Technology: Web Speech API (Zero Cost Forever)
Every modern browser (Chrome, Safari, Firefox, Edge, Samsung Internet) ships `speechSynthesis` with 20-200+ voices including multiple English and often Bengali voices. This is a **device-native API** — no server, no API key, no cost, works offline, will be supported for decades.

### 1. Voice Picker in Settings

Replace the current 2-control voice section with a full voice customization panel:

- **Voice selector dropdown** — Lists all available voices on the device, grouped by language (English voices / Bengali voices). Shows voice name and language tag.
- **Pitch slider** (0.5 – 2.0) — Low = deep/calm tone, High = bright/energetic tone. Default 0.95.
- **Volume slider** (0 – 1.0) — Independent voice volume. Default 0.8.
- **Speed slider** (0.5 – 1.5) — Already exists, keep it.
- **Preview button** — "🔊 Preview" plays a sample phrase in the selected voice so user hears it before committing.
- **Separate voice per language** — User can pick one English voice and one Bengali voice. The app uses the correct one based on current language.

### 2. Expanded Voice Cues (Configurable)

Add toggle-able voice cue categories:

| Cue Type | Example | Default |
|----------|---------|---------|
| Phase names | "Breathe In", "Hold" | On |
| Breathing countdown | "1... 2... 3... 4..." during each phase | Off |
| Session start | "Let's begin. Find a comfortable position." | On |
| Session complete | "Well done. You completed 5 minutes of breathing." | On |
| Cycle milestones | "Cycle 5 complete" (every 5 cycles) | Off |
| Encouragement | "You're doing great" / "Stay with the rhythm" (random, every ~2 min) | Off |

Each cue type is a boolean toggle in Settings under "Voice Cues". All phrases will be fully translated in both English and Bengali.

### 3. Robust Voice Loading

Fix the async voice loading issue:
- Listen for `voiceschanged` event before populating voice list
- Cache selected voice by `name + lang` in settings (not by index, which changes across sessions)
- On session start, re-resolve voice from cache with graceful fallback
- Show a small info note if no Bengali voice is available on the device

### 4. Settings Storage

Add to `AppSettings`:
```text
voicePitch: number          (default 0.95)
voiceVolume: number         (default 0.8)
voiceNameEn: string | null  (selected English voice name)
voiceNameBn: string | null  (selected Bengali voice name)
cuePhaseNames: boolean      (default true)
cueCountdown: boolean       (default false)
cueSessionStart: boolean    (default true)
cueSessionEnd: boolean      (default true)
cueCycleMilestone: boolean  (default false)
cueEncouragement: boolean   (default false)
```

Stored in localStorage via existing `AppSettings` — zero additional storage cost.

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/voice.ts` | Rebuild: voice resolver with caching, `voiceschanged` listener, `getAvailableVoices()`, `speakWithSettings()`, countdown speaker, encouragement phrases, session announcements |
| `src/lib/storage.ts` | Add new voice settings fields to `AppSettings` interface and defaults |
| `src/pages/Settings.tsx` | Replace voice section with full panel: voice picker dropdown, pitch/volume sliders, cue toggles, preview button |
| `src/pages/Session.tsx` | Integrate new cues: call session start/end announcements, countdown during phases, cycle milestones, periodic encouragement |
| `src/contexts/SettingsContext.tsx` | No changes needed (already generic) |
| `src/locales/en.ts` | ~30 new keys: voice cue phrases, settings labels, encouragement messages |
| `src/locales/bn.ts` | Matching Bengali translations |

### Technical Notes
- **Zero cost**: Web Speech API is free, built into every browser, works offline
- **Sustainable**: This API has been stable since 2014 and is a W3C standard — it will work for years
- **No storage bloat**: Only ~10 new string/boolean fields in settings (~200 bytes)
- **No new dependencies**: Pure browser API, no npm packages needed

