import { getTodaySessions, getTodayMinutes, getSessions } from "./storage";
import { getXPState } from "./xp";

export type ChallengeTier = "easy" | "medium" | "hard";
export type ChallengeCategory = "duration" | "sessions" | "quality" | "timing" | "exploration" | "endurance";

export interface DailyChallenge {
  id: string;
  title: string;
  emoji: string;
  target: number;
  unit: string;
  tier: ChallengeTier;
  category: ChallengeCategory;
  getProgress: () => number;
}

export interface ChallengeHistoryEntry {
  date: string;
  completed: number;
  total: number;
}

interface ChallengeTemplate {
  title: string;
  emoji: string;
  baseTarget: number;
  unit: string;
  tier: ChallengeTier;
  category: ChallengeCategory;
  adaptiveKey?: string; // key for adaptive scaling
  getProgress: (target: number) => number;
}

const HISTORY_KEY = "breathe_challenge_history";

// --- Adaptive target helpers ---

function get7DayAverage(key: "sessions" | "minutes" | "cycles"): number {
  const sessions = getSessions();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().substring(0, 10);
  const recent = sessions.filter((s) => s.date >= weekAgoStr);

  if (recent.length === 0) return 0;

  // Count unique days
  const uniqueDays = new Set(recent.map((s) => s.date.substring(0, 10))).size;
  const daysActive = Math.max(1, uniqueDays);

  switch (key) {
    case "sessions":
      return recent.length / daysActive;
    case "minutes":
      return recent.reduce((sum, s) => sum + s.durationSeconds, 0) / 60 / daysActive;
    case "cycles":
      return recent.reduce((sum, s) => sum + s.completedCycles, 0) / daysActive;
  }
}

function adaptTarget(baseTarget: number, adaptiveKey?: string): number {
  if (!adaptiveKey) return baseTarget;
  const avg = get7DayAverage(adaptiveKey as "sessions" | "minutes" | "cycles");
  if (avg === 0) return baseTarget; // new user, use base

  // Target = slight stretch above average (1.2x), with floor/ceiling
  const stretched = Math.ceil(avg * 1.2);
  const floor = Math.max(1, Math.floor(baseTarget * 0.5));
  const ceiling = baseTarget * 3;
  return Math.min(ceiling, Math.max(floor, stretched));
}

// --- Challenge Pool (20+ challenges across 3 tiers) ---

const CHALLENGE_POOL: ChallengeTemplate[] = [
  // === EASY ===
  {
    title: "Complete 1 session",
    emoji: "✅",
    baseTarget: 1,
    unit: "sessions",
    tier: "easy",
    category: "sessions",
    getProgress: () => getTodaySessions().length,
  },
  {
    title: "Breathe for 3 minutes",
    emoji: "🍃",
    baseTarget: 3,
    unit: "min",
    tier: "easy",
    category: "duration",
    adaptiveKey: "minutes",
    getProgress: () => getTodayMinutes(),
  },
  {
    title: "Complete 3 cycles",
    emoji: "🔄",
    baseTarget: 3,
    unit: "cycles",
    tier: "easy",
    category: "endurance",
    adaptiveKey: "cycles",
    getProgress: () => getTodaySessions().reduce((sum, s) => sum + s.completedCycles, 0),
  },
  {
    title: "Session before noon",
    emoji: "☀️",
    baseTarget: 1,
    unit: "",
    tier: "easy",
    category: "timing",
    getProgress: () => getTodaySessions().some((s) => new Date(s.date).getHours() < 12) ? 1 : 0,
  },
  {
    title: "Calm score > 50",
    emoji: "😌",
    baseTarget: 1,
    unit: "",
    tier: "easy",
    category: "quality",
    getProgress: () => getTodaySessions().some((s) => (s.calmScore ?? 0) > 50) ? 1 : 0,
  },
  {
    title: "Session longer than 2 min",
    emoji: "⏳",
    baseTarget: 1,
    unit: "",
    tier: "easy",
    category: "duration",
    getProgress: () => getTodaySessions().some((s) => s.durationSeconds >= 120) ? 1 : 0,
  },
  {
    title: "Breathe for 5 minutes",
    emoji: "🌬️",
    baseTarget: 5,
    unit: "min",
    tier: "easy",
    category: "duration",
    adaptiveKey: "minutes",
    getProgress: () => getTodayMinutes(),
  },

  // === MEDIUM ===
  {
    title: "Complete 3 sessions",
    emoji: "🎯",
    baseTarget: 3,
    unit: "sessions",
    tier: "medium",
    category: "sessions",
    adaptiveKey: "sessions",
    getProgress: () => getTodaySessions().length,
  },
  {
    title: "Breathe for 10 minutes",
    emoji: "⏱️",
    baseTarget: 10,
    unit: "min",
    tier: "medium",
    category: "duration",
    adaptiveKey: "minutes",
    getProgress: () => getTodayMinutes(),
  },
  {
    title: "Calm score > 70",
    emoji: "🧘",
    baseTarget: 1,
    unit: "",
    tier: "medium",
    category: "quality",
    getProgress: () => getTodaySessions().some((s) => (s.calmScore ?? 0) > 70) ? 1 : 0,
  },
  {
    title: "Complete 10 cycles",
    emoji: "🌀",
    baseTarget: 10,
    unit: "cycles",
    tier: "medium",
    category: "endurance",
    adaptiveKey: "cycles",
    getProgress: () => getTodaySessions().reduce((sum, s) => sum + s.completedCycles, 0),
  },
  {
    title: "Session before 8 AM",
    emoji: "🌅",
    baseTarget: 1,
    unit: "",
    tier: "medium",
    category: "timing",
    getProgress: () => getTodaySessions().some((s) => new Date(s.date).getHours() < 8) ? 1 : 0,
  },
  {
    title: "Try 2 different techniques",
    emoji: "🧭",
    baseTarget: 2,
    unit: "techniques",
    tier: "medium",
    category: "exploration",
    getProgress: () => new Set(getTodaySessions().map((s) => s.techniqueId)).size,
  },
  {
    title: "Improve mood in a session",
    emoji: "😊",
    baseTarget: 1,
    unit: "",
    tier: "medium",
    category: "quality",
    getProgress: () =>
      getTodaySessions().some((s) => s.moodBefore != null && s.moodAfter != null && s.moodAfter > s.moodBefore) ? 1 : 0,
  },
  {
    title: "Session longer than 5 min",
    emoji: "🏋️",
    baseTarget: 1,
    unit: "",
    tier: "medium",
    category: "duration",
    getProgress: () => getTodaySessions().some((s) => s.durationSeconds >= 300) ? 1 : 0,
  },

  // === HARD ===
  {
    title: "Breathe for 15 minutes",
    emoji: "🏔️",
    baseTarget: 15,
    unit: "min",
    tier: "hard",
    category: "duration",
    adaptiveKey: "minutes",
    getProgress: () => getTodayMinutes(),
  },
  {
    title: "Calm score > 85",
    emoji: "🧠",
    baseTarget: 1,
    unit: "",
    tier: "hard",
    category: "quality",
    getProgress: () => getTodaySessions().some((s) => (s.calmScore ?? 0) > 85) ? 1 : 0,
  },
  {
    title: "Complete 20 cycles",
    emoji: "💫",
    baseTarget: 20,
    unit: "cycles",
    tier: "hard",
    category: "endurance",
    adaptiveKey: "cycles",
    getProgress: () => getTodaySessions().reduce((sum, s) => sum + s.completedCycles, 0),
  },
  {
    title: "Complete 5 sessions",
    emoji: "🔥",
    baseTarget: 5,
    unit: "sessions",
    tier: "hard",
    category: "sessions",
    adaptiveKey: "sessions",
    getProgress: () => getTodaySessions().length,
  },
  {
    title: "Try a never-used technique",
    emoji: "🗺️",
    baseTarget: 1,
    unit: "",
    tier: "hard",
    category: "exploration",
    getProgress: () => {
      const allSessions = getSessions();
      const today = new Date().toISOString().substring(0, 10);
      const todaySessions = allSessions.filter((s) => s.date.startsWith(today));
      const historicalIds = new Set(
        allSessions.filter((s) => !s.date.startsWith(today)).map((s) => s.techniqueId)
      );
      return todaySessions.some((s) => !historicalIds.has(s.techniqueId)) ? 1 : 0;
    },
  },
  {
    title: "15+ cycles in one session",
    emoji: "⚡",
    baseTarget: 1,
    unit: "",
    tier: "hard",
    category: "endurance",
    getProgress: () => getTodaySessions().some((s) => s.completedCycles >= 15) ? 1 : 0,
  },
  {
    title: "Mood boost of +2 or more",
    emoji: "🌈",
    baseTarget: 1,
    unit: "",
    tier: "hard",
    category: "quality",
    getProgress: () =>
      getTodaySessions().some(
        (s) => s.moodBefore != null && s.moodAfter != null && s.moodAfter - s.moodBefore >= 2
      )
        ? 1
        : 0,
  },
  {
    title: "Session before 6 AM",
    emoji: "🌙",
    baseTarget: 1,
    unit: "",
    tier: "hard",
    category: "timing",
    getProgress: () => getTodaySessions().some((s) => new Date(s.date).getHours() < 6) ? 1 : 0,
  },
];

// --- Date-seeded hash for deterministic daily selection ---

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// --- Tier selection based on user XP level ---

function getUserTier(): { easy: boolean; medium: boolean; hard: boolean } {
  const { level } = getXPState();
  return {
    easy: true, // always available
    medium: level >= 3,
    hard: level >= 6,
  };
}

function getTierForSlot(slot: 0 | 1 | 2): ChallengeTier {
  const tiers = getUserTier();
  switch (slot) {
    case 0:
      return "easy";
    case 1:
      return tiers.medium ? "medium" : "easy";
    case 2:
      return tiers.hard ? "hard" : tiers.medium ? "medium" : "easy";
  }
}

// --- Main daily challenge picker ---

export function getDailyChallenges(): DailyChallenge[] {
  const today = new Date().toISOString().substring(0, 10);
  const seed = hashDate(today);
  const picked: DailyChallenge[] = [];
  const usedCategories = new Set<ChallengeCategory>();

  for (let slot = 0; slot < 3; slot++) {
    const tier = getTierForSlot(slot as 0 | 1 | 2);
    // Filter pool by tier, excluding used categories
    const available = CHALLENGE_POOL.filter(
      (c) => c.tier === tier && !usedCategories.has(c.category)
    );

    // Fallback: if no challenges available with unique category, relax constraint
    const pool = available.length > 0
      ? available
      : CHALLENGE_POOL.filter((c) => c.tier === tier);

    if (pool.length === 0) continue;

    const idx = (seed + slot * 7 + slot * slot * 3) % pool.length;
    const template = pool[idx];
    const target = adaptTarget(template.baseTarget, template.adaptiveKey);

    usedCategories.add(template.category);

    picked.push({
      id: `challenge-${slot}`,
      title: template.title,
      emoji: template.emoji,
      target,
      unit: template.unit,
      tier: template.tier,
      category: template.category,
      getProgress: () => template.getProgress(target),
    });
  }

  return picked;
}

export function getCompletedChallengeCount(): number {
  return getDailyChallenges().filter((c) => c.getProgress() >= c.target).length;
}

export function areAllChallengesComplete(): boolean {
  const challenges = getDailyChallenges();
  return challenges.length > 0 && challenges.every((c) => c.getProgress() >= c.target);
}

// --- Challenge History ---

function getHistory(): ChallengeHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: ChallengeHistoryEntry[]) {
  // Keep last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().substring(0, 10);
  const trimmed = history.filter((e) => e.date >= cutoffStr);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function saveTodayChallengeProgress() {
  const today = new Date().toISOString().substring(0, 10);
  const completed = getCompletedChallengeCount();
  const history = getHistory();
  const existing = history.findIndex((e) => e.date === today);

  const entry: ChallengeHistoryEntry = { date: today, completed, total: 3 };

  if (existing >= 0) {
    // Only update if better
    if (completed > history[existing].completed) {
      history[existing] = entry;
    }
  } else {
    history.push(entry);
  }

  saveHistory(history);
}

export function getChallengeStreak(): number {
  const history = getHistory();
  if (history.length === 0) return 0;

  const completeDays = new Set(
    history.filter((e) => e.completed >= e.total).map((e) => e.date)
  );

  const today = new Date();
  const todayStr = today.toISOString().substring(0, 10);

  // Allow starting from today or yesterday
  let startOffset = 0;
  if (completeDays.has(todayStr)) {
    startOffset = 0;
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);
    if (completeDays.has(yesterdayStr)) {
      startOffset = 1;
    } else {
      return 0;
    }
  }

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i - startOffset);
    const dateStr = d.toISOString().substring(0, 10);
    if (completeDays.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getMonthlyCompletionRate(): number {
  const history = getHistory();
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = monthAgo.toISOString().substring(0, 10);

  const recent = history.filter((e) => e.date >= monthAgoStr);
  if (recent.length === 0) return 0;

  const totalCompleted = recent.reduce((sum, e) => sum + e.completed, 0);
  const totalPossible = recent.reduce((sum, e) => sum + e.total, 0);
  return Math.round((totalCompleted / totalPossible) * 100);
}
