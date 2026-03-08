import { useEffect, useCallback } from "react";

export interface KeyboardShortcutCallbacks {
  onSpace?: () => void;
  onEscape?: () => void;
  onF?: () => void;
  onM?: () => void;
  onS?: () => void;
  onNavigate?: (path: string) => void;
  onHelp?: () => void;
  /** If true, session-specific shortcuts are active (disables nav shortcuts) */
  sessionActive?: boolean;
}

const NAV_KEYS: Record<string, string> = {
  "1": "/",
  "2": "/session",
  "3": "/techniques",
  "4": "/stats",
};

export function useKeyboardShortcuts(callbacks: KeyboardShortcutCallbacks) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't intercept when user is typing in input/textarea
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        callbacks.onHelp?.();
        return;
      }

      if (e.key === " " && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        callbacks.onSpace?.();
        return;
      }

      if (e.key === "Escape") {
        callbacks.onEscape?.();
        return;
      }

      const lowerKey = e.key.toLowerCase();

      if (callbacks.sessionActive) {
        if (lowerKey === "f" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          callbacks.onF?.();
        } else if (lowerKey === "m" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          callbacks.onM?.();
        } else if (lowerKey === "s" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          callbacks.onS?.();
        }
        return;
      }

      // Navigation shortcuts (only when no active session)
      const navPath = NAV_KEYS[e.key];
      if (navPath && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        callbacks.onNavigate?.(navPath);
      }
    },
    [callbacks]
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}
