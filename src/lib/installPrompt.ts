// PWA Install Prompt Manager — captures beforeinstallprompt event

let deferredPrompt: any = null;
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

export function canInstall(): boolean {
  return deferredPrompt !== null && !installed;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === "accepted";
}

export function isDismissed(): boolean {
  return sessionStorage.getItem("pwa_install_dismissed") === "1";
}

export function dismissInstallBanner(): void {
  sessionStorage.setItem("pwa_install_dismissed", "1");
}
