import { getSessions, getCurrentStreak, getSettings } from "./storage";

export interface ConsistencyBreakdown {
  regularity: number; // 0-100
  completion: number; // 0-100
  streak: number;     // 0-100
}

export interface ConsistencyResult {
  score: number; // 0-100
  breakdown: ConsistencyBreakdown;
}

export function getConsistencyScore(): ConsistencyResult {
  const sessions = getSessions();
  const settings = getSettings();
  const now = new Date();

  // Last 7 days
  const last7DaysStr = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7DaysStr.add(d.toISOString().substring(0, 10));
  }

  const weekDates = new Set<string>();
  const weekSessions = [];

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const sDate = s.date.substring(0, 10);
    if (last7DaysStr.has(sDate)) {
      weekDates.add(sDate);
      weekSessions.push(s);
    }
  }

  // Regularity (40%): days with sessions / 7
  const regularity = Math.round((weekDates.size / 7) * 100);

  // Completion (30%): avg completion rate using user's default duration

  let completion = 0;
  if (weekSessions.length > 0) {
    const targetSeconds = (settings.defaultDurationMinutes || 5) * 60;
    // Optimization: Avoid chained map and reduce passes that create intermediate arrays.
    let totalRate = 0;
    for (const s of weekSessions) {
      totalRate += Math.min(s.durationSeconds / targetSeconds, 1);
    }
    completion = Math.round((totalRate / weekSessions.length) * 100);
  }

  // Streak (30%): current streak / 7, capped at 100%
  const currentStreak = getCurrentStreak();
  const streakScore = Math.min(Math.round((currentStreak / 7) * 100), 100);

  const score = Math.round(regularity * 0.4 + completion * 0.3 + streakScore * 0.3);

  return {
    score,
    breakdown: { regularity, completion, streak: streakScore },
  };
}
