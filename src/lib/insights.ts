import { getSessions, getCurrentStreak, getLongestStreak } from "./storage";
import { getMoodRecords } from "./mood";

export interface Insight {
  key: string;
  params: Record<string, string>;
}

export function getWeeklyInsights(locale: string = "en"): Insight[] {
  const sessions = getSessions();
  const now = new Date();
  const insights: Insight[] = [];

  const thisWeek = sessions.filter((s) => {
    const diff = (now.getTime() - new Date(s.date).getTime()) / 86400000;
    return diff < 7;
  });

  const lastWeek = sessions.filter((s) => {
    const diff = (now.getTime() - new Date(s.date).getTime()) / 86400000;
    return diff >= 7 && diff < 14;
  });

  if (thisWeek.length < 3) {
    if (thisWeek.length === 0) {
      insights.push({ key: "insight.noSessions", params: {} });
    } else {
      insights.push({ key: "insight.goodStart", params: {} });
    }
    const streak = getCurrentStreak();
    if (streak > 0) {
      insights.push({ key: "insight.streakGoing", params: { days: String(streak) } });
    }
    return insights;
  }

  // Best time of day
  const hourScores: Record<number, { total: number; count: number }> = {};
  thisWeek.forEach((s) => {
    if (s.calmScore != null) {
      const hour = new Date(s.date).getHours();
      if (!hourScores[hour]) hourScores[hour] = { total: 0, count: 0 };
      hourScores[hour].total += s.calmScore;
      hourScores[hour].count++;
    }
  });
  const bestHourEntry = Object.entries(hourScores).sort(
    (a, b) => b[1].total / b[1].count - a[1].total / a[1].count
  )[0];
  if (bestHourEntry) {
    const hour = parseInt(bestHourEntry[0]);
    // Use locale-aware time formatting
    const timeStr = new Date(2000, 0, 1, hour).toLocaleTimeString(locale, { hour: "numeric", hour12: true });
    insights.push({ key: "insight.bestTime", params: { time: timeStr } });
  }

  // Technique comparison via mood records
  const moodRecords = getMoodRecords();
  const weekMoodRecords = moodRecords.filter((r) => {
    const diff = (now.getTime() - new Date(r.date).getTime()) / 86400000;
    return diff < 7 && r.moodAfter !== null;
  });
  
  if (weekMoodRecords.length >= 2) {
    const techMood: Record<string, { total: number; count: number; name: string }> = {};
    weekMoodRecords.forEach((r) => {
      if (!techMood[r.techniqueId]) {
        const session = thisWeek.find((s) => s.techniqueId === r.techniqueId);
        techMood[r.techniqueId] = { total: 0, count: 0, name: session?.techniqueName || r.techniqueId };
      }
      techMood[r.techniqueId].total += (r.moodAfter! - r.moodBefore);
      techMood[r.techniqueId].count++;
    });

    const sorted = Object.values(techMood)
      .filter((t) => t.count >= 1)
      .sort((a, b) => b.total / b.count - a.total / a.count);

    if (sorted.length >= 2 && sorted[0].total / sorted[0].count > 0) {
      const best = sorted[0];
      const second = sorted[1];
      const bestAvg = best.total / best.count;
      const secondAvg = second.count > 0 ? second.total / second.count : 0;
      if (secondAvg > 0) {
        const pctBetter = Math.round(((bestAvg - secondAvg) / secondAvg) * 100);
        if (pctBetter > 10) {
          insights.push({ key: "insight.techniqueCompare", params: { best: best.name, pct: String(pctBetter), second: second.name } });
        }
      } else if (bestAvg > 0) {
        insights.push({ key: "insight.bestTechnique", params: { name: best.name } });
      }
    }
  }

  // Streak tracking
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  if (currentStreak > 0 && currentStreak >= longestStreak - 2 && currentStreak < longestStreak) {
    insights.push({ key: "insight.nearRecord", params: { days: String(longestStreak - currentStreak) } });
  } else if (currentStreak >= longestStreak && currentStreak > 1) {
    insights.push({ key: "insight.onRecord", params: {} });
  }

  // Consistency comparison
  if (lastWeek.length > 0) {
    const diff = thisWeek.length - lastWeek.length;
    if (diff > 0) {
      insights.push({ key: "insight.moreSessionsUp", params: { count: String(diff) } });
    } else if (diff < 0) {
      insights.push({ key: "insight.fewerSessions", params: { count: String(Math.abs(diff)) } });
    }
  }

  // Duration trend
  if (lastWeek.length > 0) {
    const thisAvg = Math.round(thisWeek.reduce((s, r) => s + r.durationSeconds, 0) / thisWeek.length / 60);
    const lastAvg = Math.round(lastWeek.reduce((s, r) => s + r.durationSeconds, 0) / lastWeek.length / 60);
    if (thisAvg > lastAvg && lastAvg > 0) {
      insights.push({ key: "insight.durationUp", params: { current: String(thisAvg), previous: String(lastAvg) } });
    }
  }

  return insights.slice(0, 6);
}
