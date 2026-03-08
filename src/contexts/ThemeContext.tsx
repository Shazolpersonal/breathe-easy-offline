import React, { createContext, useContext, useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/storage";

export type ThemeId = "zen" | "ocean" | "forest" | "nightsky" | "neon";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "ocean",
  setTheme: () => {},
});

export const THEMES: Record<ThemeId, { label: string; emoji: string }> = {
  zen: { label: "Zen", emoji: "🪷" },
  ocean: { label: "Ocean", emoji: "🌊" },
  forest: { label: "Forest", emoji: "🌲" },
  nightsky: { label: "Night Sky", emoji: "🌙" },
  neon: { label: "Neon", emoji: "⚡" },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (getSettings().theme as ThemeId) || "ocean";
  });

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    updateSettings({ theme: t });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
