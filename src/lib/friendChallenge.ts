import { getTodaySessions } from "./storage";

export interface FriendChallengeParams {
  techniqueId: string;
  techniqueName: string;
  targetMinutes: number;
  targetCycles: number;
  challengerName: string;
  date: string; // ISO date
}

export interface FriendChallenge extends FriendChallengeParams {
  id: string;
  acceptedAt: string;
}

const STORAGE_KEY = "breathe_friend_challenges";

export function generateChallengeLink(params: FriendChallengeParams): string {
  const encoded = btoa(JSON.stringify(params));
  return `${window.location.origin}${window.location.pathname}#challenge=${encoded}`;
}

export function parseChallengeFromURL(): FriendChallengeParams | null {
  const hash = window.location.hash;
  if (!hash.startsWith("#challenge=")) return null;
  try {
    const encoded = hash.slice("#challenge=".length);
    return JSON.parse(atob(encoded)) as FriendChallengeParams;
  } catch {
    return null;
  }
}

export function clearChallengeHash(): void {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

export function saveFriendChallenge(params: FriendChallengeParams): FriendChallenge {
  const challenges = getFriendChallenges();
  const challenge: FriendChallenge = {
    ...params,
    id: `fc-${Date.now()}`,
    acceptedAt: new Date().toISOString(),
  };
  challenges.push(challenge);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  return challenge;
}

export function getFriendChallenges(): FriendChallenge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeFriendChallenge(id: string): void {
  const challenges = getFriendChallenges().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
}

export function getChallengeProgress(challenge: FriendChallenge): {
  minutesDone: number;
  cyclesDone: number;
  minutesTarget: number;
  cyclesTarget: number;
  isComplete: boolean;
} {
  const todaySessions = getTodaySessions().filter(
    (s) => s.techniqueId === challenge.techniqueId
  );
  const minutesDone = Math.round(
    todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
  );
  const cyclesDone = todaySessions.reduce((sum, s) => sum + s.completedCycles, 0);

  const minutesComplete = challenge.targetMinutes > 0 ? minutesDone >= challenge.targetMinutes : true;
  const cyclesComplete = challenge.targetCycles > 0 ? cyclesDone >= challenge.targetCycles : true;

  return {
    minutesDone,
    cyclesDone,
    minutesTarget: challenge.targetMinutes,
    cyclesTarget: challenge.targetCycles,
    isComplete: minutesComplete && cyclesComplete,
  };
}

export function getActiveChallenges(): FriendChallenge[] {
  const today = new Date().toISOString().split("T")[0];
  return getFriendChallenges().filter((c) => c.date === today);
}
