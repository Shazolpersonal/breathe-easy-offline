import { getCurrentStreak, getTodaySessions } from "./storage";
import { BreathingTechnique } from "./techniques";

export interface XPBreakdown {
  base: number;
  duration: number;
  difficulty: number;
  calmBonus: number;
  moodBonus: number;
  streakBonus: number;
  firstOfDay: number;
  challengeBonus: number;
  total: number;
}

export interface XPState {
  totalXP: number;
  level: number;
  title: string;
  progressToNext: number;
  xpToNext: number;
}

export interface XPEntry {
  date: string;
  amount: number;
  source: string;
}

interface XPStore {
  totalXP: number;
  history: XPEntry[];
}

const XP_KEY = "breathe_xp";
const DAILY_XP_CAP = 150;

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
  { threshold: 5000, title: "Breath Sage" },
  { threshold: 6500, title: "Inner Peace" },
  { threshold: 8500, title: "Transcendent" },
  { threshold: 11000, title: "Eternal Calm" },
  { threshold: 14000, title: "Ascended" },
];

function getStore(): XPStore {
  try {
    const raw = localStorage.getItem(XP_KEY);
    if (!raw) return { totalXP: 0, history: [] };
    const parsed = JSON.parse(raw);
    // Migrate old format (no history)
    if (!parsed.history) parsed.history = [];
    return parsed;
  } catch {
    return { totalXP: 0, history: [] };
  }
}

function saveStore(store: XPStore) {
  // Trim history to last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().substring(0, 10);
  store.history = store.history.filter((e) => e.date >= cutoffStr);
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

function getTodayXPEarned(): number {
  const store = getStore();
  const today = new Date().toISOString().substring(0, 10);
  return store.history
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function calculateSessionXP(
  durationSeconds: number,
  technique: BreathingTechnique,
  calmScore: number,
  completedChallenges: number,
  streak?: number,
  moodBefore?: number,
  moodAfter?: number
): XPBreakdown {
  const base = 10;

  // Duration: +1 per min, capped at 15
  const duration = Math.min(15, Math.floor(durationSeconds / 60));

  // Difficulty: extra XP from multiplier (applied to base only)
  const mult = DIFFICULTY_MULTIPLIER[technique.difficulty] || 1;
  const difficulty = Math.round(base * (mult - 1));

  // Calm bonus: gradient (score / 10, rounded)
  const calmBonus = Math.round(calmScore / 10);

  // Mood improvement bonus
  let moodBonus = 0;
  if (moodBefore != null && moodAfter != null && moodAfter > moodBefore) {
    moodBonus = Math.min(8, 3 + (moodAfter - moodBefore));
  }

  // Streak bonus: +2 per day, capped at 20
  const streakDays = streak ?? getCurrentStreak();
  const streakBonus = Math.min(20, streakDays * 2);

  // First session of day
  const todaySessions = getTodaySessions();
  // If this is being calculated during the session save, current session is already added
  const firstOfDay = todaySessions.length <= 1 ? 5 : 0;

  // Challenge bonus
  const challengeBonus = completedChallenges * 15;

  const rawTotal = base + duration + difficulty + calmBonus + moodBonus + streakBonus + firstOfDay + challengeBonus;

  // Apply daily cap
  const alreadyEarned = getTodayXPEarned();
  const remainingCap = Math.max(0, DAILY_XP_CAP - alreadyEarned);
  const total = Math.min(rawTotal, remainingCap);

  return {
    base,
    duration,
    difficulty,
    calmBonus,
    moodBonus,
    streakBonus,
    firstOfDay,
    challengeBonus,
    total,
  };
}

export function addXP(amount: number, source: string = "session"): { previousLevel: number; newLevel: number; totalXP: number } {
  const store = getStore();
  const prevInfo = getLevelInfo(store.totalXP);
  store.totalXP += amount;
  store.history.push({
    date: new Date().toISOString().substring(0, 10),
    amount,
    source,
  });
  saveStore(store);
  const newInfo = getLevelInfo(store.totalXP);
  return { previousLevel: prevInfo.level, newLevel: newInfo.level, totalXP: store.totalXP };
}

export function getWeeklyXP(): number {
  const store = getStore();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().substring(0, 10);
  return store.history
    .filter((e) => e.date >= weekAgoStr)
    .reduce((sum, e) => sum + e.amount, 0);
}
