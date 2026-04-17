import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSettings, updateSettings } from "@/lib/storage";

export type ThemeId = "zen" | "ocean" | "forest" | "nightsky" | "neon";
export type ThemeMode = "manual" | "manual-light" | "auto" | "auto-warm";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  isSystemLight: boolean;
  isNightWarmth: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "ocean",
  setTheme: () => {},
  themeMode: "manual",
  setThemeMode: () => {},
  isSystemLight: false,
  isNightWarmth: false,
});

export const THEMES: Record<ThemeId, { label: string; emoji: string }> = {
  zen: { label: "Zen", emoji: "🪷" },
  ocean: { label: "Ocean", emoji: "🌊" },
  forest: { label: "Forest", emoji: "🌲" },
  nightsky: { label: "Night Sky", emoji: "🌙" },
  neon: { label: "Neon", emoji: "⚡" },
};

function getIsNightTime(): boolean {
  const h = new Date().getHours();
  return h >= 20 || h < 6;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const [theme, setThemeState] = useState<ThemeId>(() => (settings.theme as ThemeId) || "ocean");
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => (settings.themeMode as ThemeMode) || "manual");
  const [isSystemLight, setIsSystemLight] = useState(() => window.matchMedia("(prefers-color-scheme: light)").matches);
  const [isNight, setIsNight] = useState(getIsNightTime);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    updateSettings({ theme: t });
  }, []);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setThemeModeState(m);
    updateSettings({ themeMode: m });
  }, []);

  // Listen to system color scheme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => setIsSystemLight(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Check night time every minute
  useEffect(() => {
    const id = setInterval(() => setIsNight(getIsNightTime()), 60000);
    return () => clearInterval(id);
  }, []);

  const isAutoMode = themeMode === "auto" || themeMode === "auto-warm";
  const showLight = (isAutoMode && isSystemLight) || themeMode === "manual-light";
  const isNightWarmth = themeMode === "auto-warm" && isNight;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-mode", showLight ? "auto" : "manual");
    root.setAttribute("data-system-light", String(showLight));
    root.setAttribute("data-night-warmth", String(isNightWarmth));
  }, [theme, isAutoMode, showLight, isNightWarmth]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeMode, setThemeMode, isSystemLight, isNightWarmth }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
