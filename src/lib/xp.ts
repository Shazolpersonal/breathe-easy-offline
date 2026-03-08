import { getCurrentStreak } from "./storage";
import { BreathingTechnique } from "./techniques";

export interface XPState {
  totalXP: number;
  level: number;
  title: string;
  progressToNext: number;
  xpToNext: number;
}

interface XPStore {
  totalXP: number;
}

const XP_KEY = "breathe_xp";

const LEVELS = [
  { threshold: 0, title: "Beginner Breather" },
  { threshold: 50, title: "Mindful Starter" },
  { threshold: 150, title: "Breath Apprentice" },
  { threshold: 350, title: "Calm Practitioner" },
  { threshold: 600, title: "Focus Adept" },
  { threshold: 1000, title: "Serenity Seeker" },
  { threshold: 1500, title: "Breath Master" },
  { threshold: 2200, title: "Calm Master" },
  { threshold: 3000, title: "Zen Sage" },
  { threshold: 4000, title: "Enlightened" },
];

function getStore(): XPStore {
  try {
    const raw = localStorage.getItem(XP_KEY);
    return raw ? JSON.parse(raw) : { totalXP: 0 };
  } catch {
    return { totalXP: 0 };
  }
}

function saveStore(store: XPStore) {
  localStorage.setItem(XP_KEY, JSON.stringify(store));
}

function getLevelInfo(xp: number): { level: number; title: string; progressToNext: number; xpToNext: number } {
  let lvl = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].threshold) {
      lvl = i + 1;
      break;
    }
  }

  const currentThreshold = LEVELS[lvl - 1].threshold;
  const nextThreshold = lvl < LEVELS.length ? LEVELS[lvl].threshold : LEVELS[LEVELS.length - 1].threshold;
  const range = nextThreshold - currentThreshold;
  const progress = lvl >= LEVELS.length ? 100 : Math.min(100, Math.round(((xp - currentThreshold) / range) * 100));
  const xpToNext = lvl >= LEVELS.length ? 0 : nextThreshold - xp;

  return {
    level: lvl,
    title: LEVELS[lvl - 1].title,
    progressToNext: progress,
    xpToNext,
  };
}

export function getXPState(): XPState {
  const store = getStore();
  const info = getLevelInfo(store.totalXP);
  return { totalXP: store.totalXP, ...info };
}

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  beginner: 1,
  intermediate: 1.5,
  advanced: 2,
};

export function calculateSessionXP(
  durationSeconds: number,
  technique: BreathingTechnique,
  calmScore: number,
  completedChallenges: number,
  streak?: number
): number {
  let xp = 10; // base
  xp += Math.floor(durationSeconds / 60); // +1 per min
  xp = Math.round(xp * (DIFFICULTY_MULTIPLIER[technique.difficulty] || 1));
  if (calmScore >= 80) xp += 5;
  xp += completedChallenges * 15;
  xp += (streak ?? getCurrentStreak()) * 2;
  return xp;
}

export function addXP(amount: number): { previousLevel: number; newLevel: number; totalXP: number } {
  const store = getStore();
  const prevInfo = getLevelInfo(store.totalXP);
  store.totalXP += amount;
  saveStore(store);
  const newInfo = getLevelInfo(store.totalXP);
  return { previousLevel: prevInfo.level, newLevel: newInfo.level, totalXP: store.totalXP };
}
