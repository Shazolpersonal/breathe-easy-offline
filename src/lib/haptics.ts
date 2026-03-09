export function vibrate(pattern: number | number[] = 50) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function vibratePhaseChange() {
  vibrate([30, 50, 30]);
}

export function vibrateDone() {
  vibrate([100, 50, 100, 50, 200]);
}

// New haptic patterns for key actions
export function vibrateSuccess() {
  vibrate([50, 30, 100]);
}

export function vibrateButton() {
  vibrate(25);
}

export function vibrateFavorite() {
  vibrate([20, 30, 20]);
}

export function vibrateBadgeUnlock() {
  vibrate([50, 50, 50, 50, 150]);
}
