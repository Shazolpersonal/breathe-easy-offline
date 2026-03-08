import { getSessions, getCustomTechniques, getCurrentStreak, SessionRecord } from "./storage";
import { getAllProgressionsPublic } from "./progression";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  check: (sessions?: SessionRecord[]) => boolean;
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

export const BADGES: Badge[] = [
  {
    id: "first-breath",
    name: "First Breath",
    emoji: "🌱",
    description: "Complete your first session",
    check: (s) => (s ?? getSessions()).length >= 1,
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    emoji: "🔥",
    description: "Reach a 7-day streak",
    check: (s) => {
      const sessions = s ?? getSessions();
      const dates = [...new Set(sessions.map(r => r.date.split("T")[0]))].sort();
      let streak = dates.length > 0 ? 1 : 0;
      let cur = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
        if (diff === 1) { cur++; streak = Math.max(streak, cur); } else if (diff > 1) cur = 1;
      }
      // Also check if streak extends to today
      if (dates.length > 0) {
        const lastDate = new Date(dates[dates.length - 1]);
        const today = new Date(); today.setHours(0,0,0,0); lastDate.setHours(0,0,0,0);
        const diffToday = (today.getTime() - lastDate.getTime()) / 86400000;
        if (diffToday > 1) streak = 0; // streak broken
      }
      return streak >= 7;
    },
  },
  {
    id: "night-owl",
    name: "Night Owl",
    emoji: "🦉",
    description: "Complete a session after 11 PM",
    check: (s) => (s ?? getSessions()).some((r) => new Date(r.date).getHours() >= 23),
  },
  {
    id: "early-bird",
    name: "Early Bird",
    emoji: "🐦",
    description: "Complete a session before 7 AM",
    check: (s) => (s ?? getSessions()).some((r) => new Date(r.date).getHours() < 7),
  },
  {
    id: "century",
    name: "Century",
    emoji: "💯",
    description: "Accumulate 100 total minutes",
    check: (s) => (s ?? getSessions()).reduce((sum, r) => sum + r.durationSeconds, 0) >= 6000,
  },
  {
    id: "marathon",
    name: "Marathon",
    emoji: "🏃",
    description: "Single session ≥ 10 minutes",
    check: (s) => (s ?? getSessions()).some((r) => r.durationSeconds >= 600),
  },
  {
    id: "creator",
    name: "Creator",
    emoji: "🎨",
    description: "Create a custom technique",
    check: () => getCustomTechniques().length >= 1,
  },
  {
    id: "zen-master",
    name: "Zen Master",
    emoji: "🧘",
    description: "Reach Level 5 on any technique",
    check: () => getAllProgressionsPublic().some((p) => p.level >= 5),
  },
  {
    id: "calm-mind",
    name: "Calm Mind",
    emoji: "🧠",
    description: "Achieve a calm score ≥ 90",
    check: (s) => (s ?? getSessions()).some((r) => (r.calmScore ?? 0) >= 90),
  },
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🧭",
    description: "Try 3 different techniques",
    check: (s) => new Set((s ?? getSessions()).map((r) => r.techniqueId)).size >= 3,
  },
  {
    id: "consistent",
    name: "Consistent",
    emoji: "📅",
    description: "Reach a 30-day streak",
    check: (s) => {
      const sessions = s ?? getSessions();
      const dates = [...new Set(sessions.map(r => r.date.split("T")[0]))].sort();
      let streak = dates.length > 0 ? 1 : 0;
      let cur = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
        if (diff === 1) { cur++; streak = Math.max(streak, cur); } else if (diff > 1) cur = 1;
      }
      return streak >= 30;
    },
  },
  {
    id: "deep-diver",
    name: "Deep Diver",
    emoji: "🌊",
    description: "Complete 50 total sessions",
    check: (s) => (s ?? getSessions()).length >= 50,
  },
  {
    id: "mood-lifter",
    name: "Mood Lifter",
    emoji: "🌈",
    description: "Improve mood by +3 in one session",
    check: (s) => (s ?? getSessions()).some((r) => r.moodBefore != null && r.moodAfter != null && (r.moodAfter - r.moodBefore) >= 3),
  },
  {
    id: "dedicated",
    name: "Dedicated",
    emoji: "⭐",
    description: "Accumulate 500 total minutes",
    check: (s) => (s ?? getSessions()).reduce((sum, r) => sum + r.durationSeconds, 0) >= 30000,
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
        const day = r.date.split("T")[0];
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
