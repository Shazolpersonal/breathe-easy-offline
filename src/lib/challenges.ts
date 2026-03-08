import { getTodaySessions, getTodayMinutes } from "./storage";

export interface DailyChallenge {
  id: string;
  title: string;
  emoji: string;
  target: number;
  unit: string;
  getProgress: () => number;
}

const CHALLENGE_POOL: Omit<DailyChallenge, "id">[] = [
  {
    title: "Complete 3 sessions",
    emoji: "🎯",
    target: 3,
    unit: "sessions",
    getProgress: () => getTodaySessions().length,
  },
  {
    title: "Breathe for 10 minutes",
    emoji: "⏱️",
    target: 10,
    unit: "min",
    getProgress: () => getTodayMinutes(),
  },
  {
    title: "Try a new technique",
    emoji: "🧭",
    target: 1,
    unit: "techniques",
    getProgress: () => new Set(getTodaySessions().map((s) => s.techniqueId)).size >= 2 ? 1 : 0,
  },
  {
    title: "Achieve calm score > 80",
    emoji: "🧠",
    target: 1,
    unit: "",
    getProgress: () => getTodaySessions().some((s) => (s.calmScore ?? 0) > 80) ? 1 : 0,
  },
  {
    title: "Session before 8 AM",
    emoji: "🌅",
    target: 1,
    unit: "",
    getProgress: () => getTodaySessions().some((s) => new Date(s.date).getHours() < 8) ? 1 : 0,
  },
  {
    title: "Session longer than 5 min",
    emoji: "🏋️",
    target: 1,
    unit: "",
    getProgress: () => getTodaySessions().some((s) => s.durationSeconds >= 300) ? 1 : 0,
  },
  {
    title: "Complete 5 cycles",
    emoji: "🔄",
    target: 5,
    unit: "cycles",
    getProgress: () => getTodaySessions().reduce((sum, s) => sum + s.completedCycles, 0),
  },
  {
    title: "Breathe for 5 minutes",
    emoji: "🍃",
    target: 5,
    unit: "min",
    getProgress: () => getTodayMinutes(),
  },
  {
    title: "Complete 2 sessions",
    emoji: "✌️",
    target: 2,
    unit: "sessions",
    getProgress: () => getTodaySessions().length,
  },
  {
    title: "Complete 10 cycles total",
    emoji: "🌀",
    target: 10,
    unit: "cycles",
    getProgress: () => getTodaySessions().reduce((sum, s) => sum + s.completedCycles, 0),
  },
];

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getDailyChallenges(): DailyChallenge[] {
  const today = new Date().toISOString().split("T")[0];
  const seed = hashDate(today);
  const pool = [...CHALLENGE_POOL];
  const picked: DailyChallenge[] = [];

  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = (seed + i * 7 + i * i) % pool.length;
    const item = pool.splice(idx, 1)[0];
    picked.push({ ...item, id: `challenge-${i}` });
  }

  return picked;
}

export function getCompletedChallengeCount(): number {
  return getDailyChallenges().filter((c) => c.getProgress() >= c.target).length;
}
