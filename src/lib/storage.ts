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
}

export interface AppSettings {
  voiceEnabled: boolean;
  voiceSpeed: number;
  vibrationEnabled: boolean;
  defaultDurationMinutes: number;
  soundEnabled: boolean;
  theme: string;
  visualizationType: "circle" | "wave" | "bars" | "mandala";
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
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
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
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
  if (data.sessions) setJSON(KEYS.sessions, data.sessions);
  if (data.settings) setJSON(KEYS.settings, data.settings);
  if (data.customTechniques) setJSON(KEYS.customTechniques, data.customTechniques);
  if (data.favorites) setJSON(KEYS.favorites, data.favorites);
}
