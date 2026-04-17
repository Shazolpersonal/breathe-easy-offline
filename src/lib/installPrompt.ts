// PWA Install Prompt Manager — captures beforeinstallprompt event

let deferredPrompt: unknown = null;
let installed = false;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
  });
}

/** Returns true when the app is running as an installed PWA (standalone / home screen) */
export function isRunningAsPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && !!(window.navigator as unknown as { standalone: boolean }).standalone)
  );
}

/** Returns true when the native install prompt is available (Chrome/Edge) */
export function canInstall(): boolean {
  return deferredPrompt !== null && !installed && !isRunningAsPWA();
}

/** Trigger the native install prompt */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === "accepted";
}

/** Detect platform for manual install hints */
export function getInstallPlatform(): "ios" | "android" | "desktop" | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/** Returns true when we should show manual install instructions (Safari/Firefox — no native prompt) */
export function canShowManualInstallHint(): boolean {
  if (isRunningAsPWA()) return false;
  if (installed) return false;
  if (deferredPrompt !== null) return false; // native prompt available instead
  return true;
}

export function isDismissed(): boolean {
  return sessionStorage.getItem("pwa_install_dismissed") === "1";
}

export function dismissInstallBanner(): void {
  sessionStorage.setItem("pwa_install_dismissed", "1");
}
