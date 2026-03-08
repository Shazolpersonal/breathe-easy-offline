

# Technical Power-Ups — 3 Features

## Feature 1: Offline-First PWA Enhancements

Upgrade the existing VitePWA config with app shortcuts, install prompt handling, and better caching.

**Changes to `vite.config.ts`**:
- Add `shortcuts` to the manifest for quick-starting top techniques (Box Breathing, 4-7-8, Wim Hof) — each shortcut navigates to `/session?technique=<id>`
- Add `navigateFallbackDenylist: [/^\/~oauth/]` to workbox config
- Add `categories: ["health", "lifestyle"]` to manifest

**New file**: `src/lib/installPrompt.ts`
- Capture the `beforeinstallprompt` event globally and expose `canInstall()` / `promptInstall()` functions
- Track install state in memory (not localStorage — ephemeral)

**Integration in `Home.tsx`**:
- Show an install banner card at the top when `canInstall()` is true — "Install Muhurto Breath for offline use" with an Install button
- Dismiss persists in sessionStorage so it doesn't reappear in same visit

## Feature 2: Keyboard Shortcuts

Add global keyboard shortcuts for power users, focused on the Session page.

**New file**: `src/hooks/useKeyboardShortcuts.ts`
- Custom hook that registers `keydown` listeners
- Session-specific shortcuts:
  - **Space**: Start/Pause/Resume
  - **Escape**: Stop session / Exit zen mode
  - **F**: Toggle fullscreen zen mode
  - **M**: Toggle mute (voice)
  - **S**: Toggle soundscape on/off
- Global shortcuts:
  - **1-4**: Navigate to Home/Session/Library/Stats (only when not in an active session)
  - **?**: Show shortcuts help overlay

**New component**: `src/components/KeyboardShortcutsHelp.tsx`
- Small modal/overlay listing all shortcuts, triggered by `?` key
- Minimal design matching app style

**Integration**:
- `Session.tsx`: Use the hook, passing callbacks for start/pause/stop/zen/voice/soundscape
- `App.tsx` or layout level: Register navigation shortcuts

## Feature 3: Widget-Style Mini-Player

A compact floating mini-player that appears when navigating away from an active session.

**Implementation approach**: 
- Store active session state in a React context (`SessionContext`) so it persists across route changes
- When a session is running and user navigates away from `/session`, show a floating mini-player bar above the BottomNav
- Mini-player shows: technique name, current phase icon, timer, pause/resume button, and a "back to session" tap area
- Tapping the mini-player navigates back to `/session` with full UI restored

**New file**: `src/contexts/SessionContext.tsx`
- Holds: `isActive`, `isPaused`, `techniqueId`, `techniqueName`, `currentPhase`, `elapsed`, `totalDuration`
- Methods: `startMiniMode()`, `stopSession()`, `pauseSession()`, `resumeSession()`
- The Session page will sync its state to this context when running

**New component**: `src/components/MiniPlayer.tsx`
- Fixed position bar (bottom: 64px to sit above BottomNav)
- Compact: technique name + phase label + elapsed time + play/pause button
- Gradient accent matching current theme
- Only visible when `isActive && currentRoute !== "/session"`

**Integration**:
- `App.tsx`: Render `<MiniPlayer />` alongside routes
- `Session.tsx`: Sync running state to SessionContext; on unmount while running, keep context alive
- `BottomNav.tsx`: Adjust spacing when mini-player is visible

## File Changes

| File | Action |
|---|---|
| `vite.config.ts` | Add shortcuts, categories, navigateFallbackDenylist |
| `src/lib/installPrompt.ts` | New — PWA install prompt capture |
| `src/hooks/useKeyboardShortcuts.ts` | New — keyboard shortcut hook |
| `src/components/KeyboardShortcutsHelp.tsx` | New — shortcuts help overlay |
| `src/contexts/SessionContext.tsx` | New — active session state context |
| `src/components/MiniPlayer.tsx` | New — floating mini-player |
| `src/pages/Home.tsx` | Add install banner |
| `src/pages/Session.tsx` | Add keyboard shortcuts + sync to SessionContext |
| `src/App.tsx` | Add SessionProvider + MiniPlayer + global shortcuts |
| `src/components/BottomNav.tsx` | Adjust for mini-player spacing |
| `src/locales/en.ts` | ~25 new keys |
| `src/locales/bn.ts` | ~25 new keys |

## Execution Order

1. PWA Enhancements (config changes + install prompt, low risk)
2. Keyboard Shortcuts (self-contained hook + help overlay)
3. Mini-Player (most complex — new context + cross-route state management)

