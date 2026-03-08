import { useEffect, useRef } from "react";

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
  // Use refs to avoid re-creating event listener on every render
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cb = callbacksRef.current;
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
        cb.onHelp?.();
        return;
      }

      if (e.key === " " && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        cb.onSpace?.();
        return;
      }

      if (e.key === "Escape") {
        cb.onEscape?.();
        return;
      }

      const lowerKey = e.key.toLowerCase();

      if (cb.sessionActive) {
        if (lowerKey === "f" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          cb.onF?.();
        } else if (lowerKey === "m" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          cb.onM?.();
        } else if (lowerKey === "s" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          cb.onS?.();
        }
        return;
      }

      // Navigation shortcuts (only when no active session)
      const navPath = NAV_KEYS[e.key];
      if (navPath && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        cb.onNavigate?.(navPath);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
