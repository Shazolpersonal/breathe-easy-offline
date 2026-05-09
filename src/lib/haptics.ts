import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export async function vibrate(pattern: number | number[] = 50) {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  } else if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export async function vibratePhaseChange() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } else {
    vibrate([30, 50, 30]);
  }
}

export async function vibrateDone() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: NotificationType.Success });
  } else {
    vibrate([100, 50, 100, 50, 200]);
  }
}

// New haptic patterns for key actions
export async function vibrateSuccess() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: NotificationType.Success });
  } else {
    vibrate([50, 30, 100]);
  }
}

export async function vibrateButton() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  } else {
    vibrate(25);
  }
}

export async function vibrateFavorite() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  } else {
    vibrate([20, 30, 20]);
  }
}

export async function vibrateBadgeUnlock() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: NotificationType.Success });
  } else {
    vibrate([50, 50, 50, 50, 150]);
  }
}
