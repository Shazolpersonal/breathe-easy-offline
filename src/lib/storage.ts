import { BreathingTechnique } from "./techniques";

export interface SessionRecord {
  id: string;
  techniqueId: string;
  techniqueName: string;
  date: string; // ISO date string
  durationSeconds: number;
  completedCycles: number;
  moodBefore?: number;
  moodAfter?: number;
  calmScore?: number;
  journal?: string;
  breathAccuracy?: number;
  avgHeartRate?: number;
  heartCoherence?: number;
}

export interface AppSettings {
  voiceEnabled: boolean;
  voiceSpeed: number;
  vibrationEnabled: boolean;
  defaultDurationMinutes: number;
  soundEnabled: boolean;
  theme: string;
  visualizationType: "circle" | "wave" | "bars" | "mandala";
  soundscapeType: "off" | "rain" | "ocean" | "wind";
  soundscapeVolume: number;
  themeMode: "manual" | "auto" | "auto-warm";
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  breathDetectionEnabled: boolean;
  heartRateEnabled: boolean;
}

const KEYS = {
  sessions: "breathe_sessions",
  settings: "breathe_settings",
  customTechniques: "breathe_custom_techniques",
  favorites: "breathe_favorites",
};

const DEFAULT_SETTINGS: AppSettings = {
  voiceEnabled: true,
  voiceSpeed: 0.9,
  vibrationEnabled: true,
  defaultDurationMinutes: 5,
  soundEnabled: true,
  theme: "ocean",
  visualizationType: "circle",
  soundscapeType: "off",
  soundscapeVolume: 0.5,
  themeMode: "manual",
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  breathDetectionEnabled: false,
  heartRateEnabled: false,
};

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Sessions
export function getSessions(): SessionRecord[] {
  return getJSON<SessionRecord[]>(KEYS.sessions, []);
}

export function addSession(session: SessionRecord) {
  const sessions = getSessions();
  sessions.push(session);
  setJSON(KEYS.sessions, sessions);
}

export function getTodaySessions(): SessionRecord[] {
  const today = new Date().toISOString().split("T")[0];
  return getSessions().filter((s) => s.date.startsWith(today));
}

export function getTodayMinutes(): number {
  return Math.round(getTodaySessions().reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
}

export function getCurrentStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map((s) => s.date.split("T")[0]))].sort().reverse();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  let streak = 0;
  // Allow starting from today or yesterday (user hasn't done today's session yet)
  let startOffset = 0;
  if (dates[0] === todayStr) {
    startOffset = 0;
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (dates[0] === yesterdayStr) {
      startOffset = 1;
    } else {
      return 0;
    }
  }

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i - startOffset);
    const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, "0")}-${String(expected.getDate()).padStart(2, "0")}`;
    if (dates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getLongestStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;

  const dates = [...new Set(sessions.map((s) => s.date.split("T")[0]))].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

// Settings
export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...getJSON<Partial<AppSettings>>(KEYS.settings, {}) };
}

export function updateSettings(partial: Partial<AppSettings>) {
  const current = getSettings();
  setJSON(KEYS.settings, { ...current, ...partial });
}

// Custom techniques
export function getCustomTechniques(): BreathingTechnique[] {
  return getJSON<BreathingTechnique[]>(KEYS.customTechniques, []);
}

export function saveCustomTechnique(technique: BreathingTechnique) {
  const techniques = getCustomTechniques();
  const idx = techniques.findIndex((t) => t.id === technique.id);
  if (idx >= 0) techniques[idx] = technique;
  else techniques.push(technique);
  setJSON(KEYS.customTechniques, techniques);
}

export function deleteCustomTechnique(id: string) {
  setJSON(KEYS.customTechniques, getCustomTechniques().filter((t) => t.id !== id));
}

// Favorites
export function getFavorites(): string[] {
  return getJSON<string[]>(KEYS.favorites, ["box-breathing", "4-7-8"]);
}

export function toggleFavorite(id: string) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  setJSON(KEYS.favorites, favs);
}

// Export / Import
export function exportData(): string {
  return JSON.stringify({
    sessions: getSessions(),
    settings: getSettings(),
    customTechniques: getCustomTechniques(),
    favorites: getFavorites(),
  }, null, 2);
}

export function importData(json: string) {
  const data = JSON.parse(json);
  // Validate sessions array
  if (data.sessions) {
    if (!Array.isArray(data.sessions)) throw new Error("Invalid sessions data");
    for (const s of data.sessions) {
      if (typeof s.id !== "string" || typeof s.techniqueId !== "string" || typeof s.date !== "string" || typeof s.durationSeconds !== "number") {
        throw new Error("Invalid session record found");
      }
    }
    setJSON(KEYS.sessions, data.sessions);
  }
  if (data.settings && typeof data.settings === "object") {
    setJSON(KEYS.settings, data.settings);
  }
  if (data.customTechniques) {
    if (!Array.isArray(data.customTechniques)) throw new Error("Invalid custom techniques data");
    setJSON(KEYS.customTechniques, data.customTechniques);
  }
  if (data.favorites) {
    if (!Array.isArray(data.favorites)) throw new Error("Invalid favorites data");
    setJSON(KEYS.favorites, data.favorites);
  }
}
