import { getSessions, getCurrentStreak } from "./storage";
import { getXPState } from "./xp";

export interface WeeklySummaryData {
  totalSessions: number;
  totalMinutes: number;
  streak: number;
  xpEarned: number;
  bestCalmScore: number | null;
  mostUsedTechnique: string | null;
  hasData: boolean;
}

export function getWeeklySummary(): WeeklySummaryData {
  const sessions = getSessions();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  const weekSessions = sessions.filter(s => s.date >= weekAgoStr);

  if (weekSessions.length === 0) {
    return { totalSessions: 0, totalMinutes: 0, streak: 0, xpEarned: 0, bestCalmScore: null, mostUsedTechnique: null, hasData: false };
  }

  const totalMinutes = Math.round(weekSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
  const streak = getCurrentStreak();

  // XP earned this week
  let xpEarned = 0;
  try {
    const raw = localStorage.getItem("breathe_xp");
    if (raw) {
      const store = JSON.parse(raw);
      if (store.history) {
        const weekAgoDate = weekAgo.toISOString().substring(0, 10);
        xpEarned = store.history
          .filter((e: { date: string; amount: number }) => e.date >= weekAgoDate)
          .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
      }
    }
  } catch { /* empty */ }

  // Best calm score
  const calmScores = weekSessions.filter(s => s.calmScore != null).map(s => s.calmScore!);
  const bestCalmScore = calmScores.length > 0 ? Math.max(...calmScores) : null;

  // Most used technique
  const techCount: Record<string, { name: string; count: number }> = { /* empty */ };
  weekSessions.forEach(s => {
    if (!techCount[s.techniqueId]) techCount[s.techniqueId] = { name: s.techniqueName, count: 0 };
    techCount[s.techniqueId].count++;
  });
  const sorted = Object.values(techCount).sort((a, b) => b.count - a.count);
  const mostUsedTechnique = sorted[0]?.name || null;

  return { totalSessions: weekSessions.length, totalMinutes, streak, xpEarned, bestCalmScore, mostUsedTechnique, hasData: true };
}

const SEEN_KEY = "breathe_weekly_summary_seen";

export function hasSeenWeeklySummary(): boolean {
  const seen = localStorage.getItem(SEEN_KEY);
  if (!seen) return false;
  // Check if seen this week (same ISO week)
  const seenDate = new Date(seen);
  const now = new Date();
  const getWeekNumber = (d: Date) => {
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  };
  return seenDate.getFullYear() === now.getFullYear() && getWeekNumber(seenDate) === getWeekNumber(now);
}

export function markWeeklySummarySeen() {
  localStorage.setItem(SEEN_KEY, new Date().toISOString());
}
