import { getSessions, getCustomTechniques, SessionRecord } from "./storage";
import { getAllProgressionsPublic } from "./progression";
import { getCurrentStreak } from "./storage";

export interface BadgeProgress {
  current: number;
  target: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (sessions?: SessionRecord[]) => boolean;
  progress: (sessions?: SessionRecord[]) => BadgeProgress;
}

const SEEN_KEY = "breathe_badges_seen";

function getSeenBadges(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markBadgesSeen(ids: string[]) {
  const seen = [...new Set([...getSeenBadges(), ...ids])];
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

function getStreakFromSessions(sessions: SessionRecord[]): number {
  const dateSet = new Set<string>();
  for (let i = 0; i < sessions.length; i++) {
    dateSet.add(sessions[i].date.substring(0, 10));
  }
  const dates = Array.from(dateSet).sort();
  let streak = dates.length > 0 ? 1 : 0;
  let cur = 1;
  if (dates.length > 0) {
    let prevTime = Date.parse(dates[0]);
    for (let i = 1; i < dates.length; i++) {
      const currTime = Date.parse(dates[i]);
      const diff = (currTime - prevTime) / 86400000;
      if (diff === 1) { cur++; streak = Math.max(streak, cur); } else if (diff > 1) cur = 1;
      prevTime = currTime;
    }
  }
  if (dates.length > 0) {
    const lastDate = new Date(dates[dates.length - 1]);
    const today = new Date(); today.setHours(0,0,0,0); lastDate.setHours(0,0,0,0);
    const diffToday = (today.getTime() - lastDate.getTime()) / 86400000;
    if (diffToday > 1) streak = 0;
  }
  return streak;
}

function getLongestStreakFromSessions(sessions: SessionRecord[]): number {
  const dateSet = new Set<string>();
  for (let i = 0; i < sessions.length; i++) {
    dateSet.add(sessions[i].date.substring(0, 10));
  }
  const dates = Array.from(dateSet).sort();
  let streak = dates.length > 0 ? 1 : 0;
  let cur = 1;
  if (dates.length > 0) {
    let prevTime = Date.parse(dates[0]);
    for (let i = 1; i < dates.length; i++) {
      const currTime = Date.parse(dates[i]);
      const diff = (currTime - prevTime) / 86400000;
      if (diff === 1) { cur++; streak = Math.max(streak, cur); } else if (diff > 1) cur = 1;
      prevTime = currTime;
    }
  }
  return streak;
}

export const BADGES: Badge[] = [
  {
    id: "first-breath",
    name: "First Breath",
    emoji: "🌱",
    description: "Complete your first session",
    check: (s) => (s ?? getSessions()).length >= 1,
    progress: (s) => ({ current: Math.min((s ?? getSessions()).length, 1), target: 1 }),
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    emoji: "🔥",
    description: "Reach a 7-day streak",
    check: (s) => getStreakFromSessions(s ?? getSessions()) >= 7,
    progress: (s) => ({ current: Math.min(getStreakFromSessions(s ?? getSessions()), 7), target: 7 }),
  },
  {
    id: "night-owl",
    name: "Night Owl",
    emoji: "🦉",
    description: "Complete a session after 11 PM",
    check: (s) => (s ?? getSessions()).some((r) => new Date(r.date).getHours() >= 23),
    progress: (s) => ({ current: (s ?? getSessions()).some((r) => new Date(r.date).getHours() >= 23) ? 1 : 0, target: 1 }),
  },
  {
    id: "early-bird",
    name: "Early Bird",
    emoji: "🐦",
    description: "Complete a session before 7 AM",
    check: (s) => (s ?? getSessions()).some((r) => new Date(r.date).getHours() < 7),
    progress: (s) => ({ current: (s ?? getSessions()).some((r) => new Date(r.date).getHours() < 7) ? 1 : 0, target: 1 }),
  },
  {
    id: "century",
    name: "Century",
    emoji: "💯",
    description: "Accumulate 100 total minutes",
    check: (s) => (s ?? getSessions()).reduce((sum, r) => sum + r.durationSeconds, 0) >= 6000,
    progress: (s) => ({ current: Math.min(Math.round((s ?? getSessions()).reduce((sum, r) => sum + r.durationSeconds, 0) / 60), 100), target: 100 }),
  },
  {
    id: "marathon",
    name: "Marathon",
    emoji: "🏃",
    description: "Single session ≥ 10 minutes",
    check: (s) => (s ?? getSessions()).some((r) => r.durationSeconds >= 600),
    progress: (s) => {
      const best = Math.max(0, ...(s ?? getSessions()).map(r => r.durationSeconds));
      return { current: Math.min(Math.round(best / 60), 10), target: 10 };
    },
  },
  {
    id: "creator",
    name: "Creator",
    emoji: "🎨",
    description: "Create a custom technique",
    check: () => getCustomTechniques().length >= 1,
    progress: () => ({ current: Math.min(getCustomTechniques().length, 1), target: 1 }),
  },
  {
    id: "zen-master",
    name: "Zen Master",
    emoji: "🧘",
    description: "Reach Level 5 on any technique",
    check: () => getAllProgressionsPublic().some((p) => p.level >= 5),
    progress: () => {
      const maxLevel = Math.max(0, ...getAllProgressionsPublic().map(p => p.level));
      return { current: Math.min(maxLevel, 5), target: 5 };
    },
  },
  {
    id: "calm-mind",
    name: "Calm Mind",
    emoji: "🧠",
    description: "Achieve a calm score ≥ 90",
    check: (s) => (s ?? getSessions()).some((r) => (r.calmScore ?? 0) >= 90),
    progress: (s) => {
      const best = Math.max(0, ...(s ?? getSessions()).map(r => r.calmScore ?? 0));
      return { current: Math.min(best, 90), target: 90 };
    },
  },
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🧭",
    description: "Try 3 different techniques",
    check: (s) => new Set((s ?? getSessions()).map((r) => r.techniqueId)).size >= 3,
    progress: (s) => ({ current: Math.min(new Set((s ?? getSessions()).map((r) => r.techniqueId)).size, 3), target: 3 }),
  },
  {
    id: "consistent",
    name: "Consistent",
    emoji: "📅",
    description: "Reach a 30-day streak",
    check: (s) => getLongestStreakFromSessions(s ?? getSessions()) >= 30,
    progress: (s) => ({ current: Math.min(getLongestStreakFromSessions(s ?? getSessions()), 30), target: 30 }),
  },
  {
    id: "deep-diver",
    name: "Deep Diver",
    emoji: "🌊",
    description: "Complete 50 total sessions",
    check: (s) => (s ?? getSessions()).length >= 50,
    progress: (s) => ({ current: Math.min((s ?? getSessions()).length, 50), target: 50 }),
  },
  {
    id: "mood-lifter",
    name: "Mood Lifter",
    emoji: "🌈",
    description: "Improve mood by +3 in one session",
    check: (s) => (s ?? getSessions()).some((r) => r.moodBefore != null && r.moodAfter != null && (r.moodAfter - r.moodBefore) >= 3),
    progress: (s) => {
      const best = Math.max(0, ...(s ?? getSessions()).filter(r => r.moodBefore != null && r.moodAfter != null).map(r => r.moodAfter! - r.moodBefore!));
      return { current: Math.min(best, 3), target: 3 };
    },
  },
  {
    id: "dedicated",
    name: "Dedicated",
    emoji: "⭐",
    description: "Accumulate 500 total minutes",
    check: (s) => (s ?? getSessions()).reduce((sum, r) => sum + r.durationSeconds, 0) >= 30000,
    progress: (s) => ({ current: Math.min(Math.round((s ?? getSessions()).reduce((sum, r) => sum + r.durationSeconds, 0) / 60), 500), target: 500 }),
  },
  {
    id: "perfect-week",
    name: "Perfect Week",
    emoji: "🏆",
    description: "7 consecutive days with ≥ 5 min each",
    check: (s) => {
      const sessions = s ?? getSessions();
      const dayMinutes: Record<string, number> = {};
      sessions.forEach((r) => {
        const day = r.date.substring(0, 10);
        dayMinutes[day] = (dayMinutes[day] || 0) + r.durationSeconds / 60;
      });
      const days = Object.entries(dayMinutes)
        .filter(([, m]) => m >= 5)
        .map(([d]) => d)
        .sort();
      let streak = 1;
      for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        if ((curr.getTime() - prev.getTime()) / 86400000 === 1) {
          streak++;
          if (streak >= 7) return true;
        } else {
          streak = 1;
        }
      }
      return streak >= 7;
    },
    progress: (s) => {
      const sessions = s ?? getSessions();
      const dayMinutes: Record<string, number> = {};
      sessions.forEach((r) => {
        const day = r.date.substring(0, 10);
        dayMinutes[day] = (dayMinutes[day] || 0) + r.durationSeconds / 60;
      });
      const days = Object.entries(dayMinutes)
        .filter(([, m]) => m >= 5)
        .map(([d]) => d)
        .sort();
      let maxStreak = days.length > 0 ? 1 : 0;
      let cur = 1;
      for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        if ((curr.getTime() - prev.getTime()) / 86400000 === 1) {
          cur++;
          maxStreak = Math.max(maxStreak, cur);
        } else {
          cur = 1;
        }
      }
      return { current: Math.min(maxStreak, 7), target: 7 };
    },
  },
];

export function checkAllBadges(sessions?: SessionRecord[]): { unlocked: Badge[]; locked: Badge[] } {
  const s = sessions ?? getSessions();
  const unlocked: Badge[] = [];
  const locked: Badge[] = [];
  for (const badge of BADGES) {
    if (badge.check(s)) unlocked.push(badge);
    else locked.push(badge);
  }
  return { unlocked, locked };
}

export function getNewlyUnlocked(): Badge[] {
  const seen = getSeenBadges();
  const { unlocked } = checkAllBadges();
  const newOnes = unlocked.filter((b) => !seen.includes(b.id));
  if (newOnes.length > 0) {
    markBadgesSeen(newOnes.map((b) => b.id));
  }
  return newOnes;
}
