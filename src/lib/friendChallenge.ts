import { getTodaySessions } from "./storage";
import { sanitizeString } from "./utils";

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
  // Unicode-safe base64 encoding
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(params))));
  return `${window.location.origin}${window.location.pathname}#challenge=${encoded}`;
}

function isValidChallenge(obj: unknown): obj is FriendChallengeParams {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;

  // Strict regex for ID and Date
  const idRegex = /^[a-zA-Z0-9-]+$/;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  return (
    typeof c.techniqueId === 'string' &&
    c.techniqueId.length > 0 &&
    c.techniqueId.length <= 50 &&
    idRegex.test(c.techniqueId) &&

    typeof c.techniqueName === 'string' &&
    c.techniqueName.length > 0 &&
    c.techniqueName.length <= 100 &&

    typeof c.challengerName === 'string' &&
    c.challengerName.length > 0 &&
    c.challengerName.length <= 80 &&

    typeof c.targetMinutes === 'number' &&
    Number.isFinite(c.targetMinutes) &&
    c.targetMinutes >= 0 &&
    c.targetMinutes <= 120 &&

    typeof c.targetCycles === 'number' &&
    Number.isFinite(c.targetCycles) &&
    c.targetCycles >= 0 &&
    c.targetCycles <= 500 &&

    typeof c.date === 'string' &&
    c.date.length <= 10 &&
    dateRegex.test(c.date)
  );
}

export function parseChallengeFromURL(): FriendChallengeParams | null {
  const hash = window.location.hash;
  if (!hash.startsWith("#challenge=")) return null;

  // Security: limit hash length to prevent DoS/memory issues
  if (hash.length > 2000) return null;

  try {
    const encoded = hash.slice("#challenge=".length);
    // Unicode-safe base64 decoding
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(decoded);

    if (!isValidChallenge(parsed)) return null;

    // Security: sanitize user-controlled strings to prevent XSS
    return {
      ...parsed,
      techniqueName: sanitizeString(parsed.techniqueName),
      challengerName: sanitizeString(parsed.challengerName),
    };
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
  const today = new Date();
  return getFriendChallenges().filter((c) => {
    // Active if accepted within the last 7 days (not just creation date)
    const acceptedDate = new Date(c.acceptedAt);
    const daysSinceAccepted = Math.floor((today.getTime() - acceptedDate.getTime()) / 86400000);
    return daysSinceAccepted < 7;
  });
}
