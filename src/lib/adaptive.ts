import { SessionRecord, getSessions, getSettings } from "./storage";
import { PRESET_TECHNIQUES, BreathingTechnique, getCycleDuration } from "./techniques";
import { getCustomTechniques } from "./storage";
import { getBestTechniqueForMood } from "./mood";

type TimeBucket = "morning" | "afternoon" | "evening" | "night";

function getTimeBucket(hour: number): TimeBucket {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function getSessionBucket(session: SessionRecord): TimeBucket {
  const hour = new Date(session.date).getHours();
  return getTimeBucket(hour);
}

export interface AdaptiveResult {
  techniqueId: string;
  durationMinutes: number;
  reasonKey: string;
  reasonParams?: Record<string, string | number>;
}

/**
 * Analyzes session history to recommend the optimal technique and duration.
 * Returns null if insufficient data (<5 sessions).
 */
export function getAdaptiveSession(currentMood?: number | null): AdaptiveResult | null {
  const sessions = getSessions();
  if (sessions.length < 5) return null;

  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const now = new Date();
  const currentBucket = getTimeBucket(now.getHours());

  // 1. If mood is provided, check mood-based recommendation first
  if (currentMood !== null && currentMood !== undefined) {
    const moodBest = getBestTechniqueForMood(currentMood);
    if (moodBest) {
      const tech = allTechniques.find(t => t.id === moodBest);
      if (tech) {
        const duration = getOptimalDuration(sessions, moodBest, currentBucket);
        return {
          techniqueId: moodBest,
          durationMinutes: duration,
          reasonKey: "adaptive.moodBased",
        };
      }
    }
  }

  // 2. Time-of-day analysis: find technique with highest avg calm score for this bucket
  const bucketSessions = sessions.filter(s => getSessionBucket(s) === currentBucket);
  
  if (bucketSessions.length >= 3) {
    const best = findBestByCalm(bucketSessions, allTechniques);
    if (best) {
      const duration = getOptimalDuration(sessions, best.id, currentBucket);
      return {
        techniqueId: best.id,
        durationMinutes: duration,
        reasonKey: "adaptive.timeBased",
        reasonParams: { bucket: currentBucket },
      };
    }
  }

  // 3. Overall best technique by calm score + completion rate
  const best = findBestByCalm(sessions, allTechniques);
  if (best) {
    const duration = getOptimalDuration(sessions, best.id, currentBucket);
    return {
      techniqueId: best.id,
      durationMinutes: duration,
      reasonKey: "adaptive.overall",
    };
  }

  return null;
}

function findBestByCalm(
  sessions: SessionRecord[],
  allTechniques: BreathingTechnique[]
): BreathingTechnique | null {
  const groups: Record<string, { totalCalm: number; count: number; completionRate: number; completed: number; total: number }> = {};
  const defaultDuration = getSettings().defaultDurationMinutes * 60;

  for (const s of sessions) {
    if (!groups[s.techniqueId]) {
      groups[s.techniqueId] = { totalCalm: 0, count: 0, completionRate: 0, completed: 0, total: 0 };
    }
    const g = groups[s.techniqueId];
    g.total++;
    if (s.calmScore !== undefined) {
      g.totalCalm += s.calmScore;
      g.count++;
    }
    // Consider "completed" if duration >= 50% of default
    if (s.durationSeconds >= defaultDuration * 0.5) {
      g.completed++;
    }
  }

  let bestId: string | null = null;
  let bestScore = -Infinity;

  for (const [id, g] of Object.entries(groups)) {
    if (g.count < 2) continue;
    // Filter out techniques where completion rate < 40%
    const completionRate = g.completed / g.total;
    if (completionRate < 0.4) continue;

    const avgCalm = g.totalCalm / g.count;
    // Weighted score: calm score * completion rate bonus
    const score = avgCalm * (0.7 + 0.3 * completionRate);
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  if (!bestId) return null;
  return allTechniques.find(t => t.id === bestId) || null;
}

function getOptimalDuration(sessions: SessionRecord[], techniqueId: string, bucket: TimeBucket): number {
  const relevant = sessions.filter(
    s => s.techniqueId === techniqueId && getSessionBucket(s) === bucket && s.durationSeconds > 30
  );

  if (relevant.length < 2) {
    // Fall back to all sessions with this technique
    const all = sessions.filter(s => s.techniqueId === techniqueId && s.durationSeconds > 30);
    if (all.length < 2) return getSettings().defaultDurationMinutes;
    const avg = all.reduce((sum, s) => sum + s.durationSeconds, 0) / all.length;
    return Math.max(1, Math.round(avg / 60));
  }

  const avg = relevant.reduce((sum, s) => sum + s.durationSeconds, 0) / relevant.length;
  return Math.max(1, Math.round(avg / 60));
}
