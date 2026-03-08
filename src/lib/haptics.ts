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
