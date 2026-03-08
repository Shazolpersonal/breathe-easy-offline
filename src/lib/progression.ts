import { BreathingTechnique, BreathingPhase } from "./techniques";

export interface UserProgression {
  techniqueId: string;
  level: number;
  sessionsCompleted: number;
  totalCycles: number;
}

const PROGRESSION_KEY = "breathe_progression";

const LEVEL_THRESHOLDS = [0, 5, 15, 30, 50];
const LEVEL_NAMES = ["Beginner", "Novice", "Skilled", "Expert", "Master"];
const UNLOCK_THRESHOLDS: Record<string, number> = {
  beginner: 0,
  intermediate: 10,
  advanced: 25,
};

function getAllProgressions(): UserProgression[] {
  try {
    const raw = localStorage.getItem(PROGRESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAllProgressions(data: UserProgression[]) {
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(data));
}

export function getProgression(techniqueId: string): UserProgression {
  const all = getAllProgressions();
  return all.find((p) => p.techniqueId === techniqueId) || {
    techniqueId,
    level: 1,
    sessionsCompleted: 0,
    totalCycles: 0,
  };
}

export function getLevelFromSessions(sessions: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (sessions >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
}

export function getNextLevelThreshold(level: number): number {
  return level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : Infinity;
}

export function getLevelProgress(progression: UserProgression): number {
  const currentThreshold = LEVEL_THRESHOLDS[progression.level - 1] || 0;
  const nextThreshold = getNextLevelThreshold(progression.level);
  if (nextThreshold === Infinity) return 100;
  const range = nextThreshold - currentThreshold;
  return Math.min(100, Math.round(((progression.sessionsCompleted - currentThreshold) / range) * 100));
}

export function updateProgression(techniqueId: string, cycles: number): { leveledUp: boolean; newLevel: number } {
  const all = getAllProgressions();
  const idx = all.findIndex((p) => p.techniqueId === techniqueId);
  const current = idx >= 0 ? all[idx] : { techniqueId, level: 1, sessionsCompleted: 0, totalCycles: 0 };

  current.sessionsCompleted += 1;
  current.totalCycles += cycles;
  const newLevel = getLevelFromSessions(current.sessionsCompleted);
  const leveledUp = newLevel > current.level;
  current.level = newLevel;

  if (idx >= 0) all[idx] = current;
  else all.push(current);
  saveAllProgressions(all);

  return { leveledUp, newLevel };
}

export function getTotalSessionCount(): number {
  return getAllProgressions().reduce((sum, p) => sum + p.sessionsCompleted, 0);
}

export function isUnlocked(technique: BreathingTechnique): boolean {
  const threshold = UNLOCK_THRESHOLDS[technique.difficulty] ?? 0;
  return getTotalSessionCount() >= threshold;
}

export function getUnlockRemaining(technique: BreathingTechnique): number {
  const threshold = UNLOCK_THRESHOLDS[technique.difficulty] ?? 0;
  return Math.max(0, threshold - getTotalSessionCount());
}

export function getScaledPhases(technique: BreathingTechnique, level: number): BreathingPhase[] {
  const bonus = Math.max(0, level - 1); // +1s per level above 1
  return technique.phases.map((p) => ({
    ...p,
    duration: p.duration + bonus,
  }));
}
