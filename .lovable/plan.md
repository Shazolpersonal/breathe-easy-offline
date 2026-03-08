

# Smart Install Button — Browser Only, Hidden When Installed as PWA

## Current State

The app already has a PWA install banner on the Home page, but it relies on `beforeinstallprompt` (Chrome/Edge only — does not fire on Safari/iOS). The current logic: `canInstall()` checks if `deferredPrompt` exists and app isn't installed. This misses iOS entirely and doesn't detect standalone mode.

## The Approach

The key insight: **When a PWA is opened from the home screen, `window.matchMedia('(display-mode: standalone)')` returns true** (or `navigator.standalone` on iOS Safari). When opened in a regular browser tab, it returns false. This is the reliable, cross-platform way to distinguish "browser visitor" from "installed app user."

### Detection Logic

Add a `isRunningAsPWA()` function to `installPrompt.ts`:
```typescript
export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;
}
```

### Visibility Rules

Show the install banner when: **NOT running as PWA** AND **NOT dismissed this session**.

- On Chrome/Edge: The native `beforeinstallprompt` fires → show the "Install" button that triggers the native prompt
- On Safari/iOS/Firefox (no `beforeinstallprompt`): Show a manual instruction banner explaining "Tap Share → Add to Home Screen"
- When running as installed PWA: **Never show any install UI**

## Changes

### 1. `src/lib/installPrompt.ts`
- Add `isRunningAsPWA()` function
- Update `canInstall()` to also return false when running as PWA
- Add `canShowManualInstallHint()` — returns true when no native prompt available, not running as PWA, and not dismissed

### 2. `src/pages/Home.tsx`
- Import `isRunningAsPWA` and `canShowManualInstallHint`
- When `canInstall()` is true → show native install button (existing behavior)
- When `canShowManualInstallHint()` is true → show instruction banner with platform-specific text (iOS: "Share → Add to Home Screen", Android Firefox: "Menu → Install")
- When `isRunningAsPWA()` → show nothing

### 3. `src/locales/en.ts` — Add keys:
- `"install.manual.title"`: "Install Muhurto Breath"
- `"install.manual.ios"`: "Tap the Share button, then 'Add to Home Screen'"
- `"install.manual.android"`: "Tap the browser menu, then 'Add to Home Screen'"
- `"install.manual.desktop"`: "Use your browser menu to install this app"

### 4. `src/locales/bn.ts` — Add matching Bengali translations

### 5. `src/components/BottomNav.tsx` (optional enhancement)
- Hide any install-related UI when running as PWA (if applicable)

## Summary

One new detection function, one new helper, locale keys in both languages, and updated Home.tsx banner logic. No cloud, no backend — pure client-side detection using standard Web APIs.

