import { PRESET_TECHNIQUES } from "./techniques";
import { getCustomTechniques } from "./storage";

export interface MoodOption {
  value: number;
  emoji: string;
  label: string;
}

export const MOODS: MoodOption[] = [
  { value: 1, emoji: "😫", label: "mood.1" },
  { value: 2, emoji: "😟", label: "mood.2" },
  { value: 3, emoji: "😐", label: "mood.3" },
  { value: 4, emoji: "🙂", label: "mood.4" },
  { value: 5, emoji: "😌", label: "mood.5" },
];

/** Get the i18n key for a mood value */
export function getMoodLabelKey(value: number): string {
  return MOODS.find((m) => m.value === value)?.label ?? "mood.3";
}

export interface MoodRecord {
  sessionId: string;
  techniqueId: string;
  moodBefore: number;
  moodAfter: number | null;
  date: string;
}

const MOOD_KEY = "breathe_mood_records";

export function getMoodRecords(): MoodRecord[] {
  try {
    const raw = localStorage.getItem(MOOD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMoodRecord(record: MoodRecord) {
  const records = getMoodRecords();
  const idx = records.findIndex((r) => r.sessionId === record.sessionId);
  if (idx >= 0) records[idx] = record;
  else records.push(record);
  localStorage.setItem(MOOD_KEY, JSON.stringify(records));
}

export function getMoodLabel(value: number): string {
  return MOODS.find((m) => m.value === value)?.label ?? "Unknown";
}

export function getMoodEmoji(value: number): string {
  return MOODS.find((m) => m.value === value)?.emoji ?? "😐";
}

/**
 * For a given starting mood, find the technique with the highest
 * average mood improvement. Returns null if fewer than 3 completed
 * records exist for that mood level.
 */
export function getBestTechniqueForMood(currentMood: number): string | null {
  const records = getMoodRecords().filter(
    (r) => r.moodBefore === currentMood && r.moodAfter !== null
  );

  if (records.length < 3) return null;

  // Group by techniqueId → average improvement
  const groups: Record<string, { total: number; count: number }> = {};
  for (const r of records) {
    if (!groups[r.techniqueId]) groups[r.techniqueId] = { total: 0, count: 0 };
    groups[r.techniqueId].total += (r.moodAfter! - r.moodBefore);
    groups[r.techniqueId].count++;
  }

  let bestId: string | null = null;
  let bestAvg = -Infinity;

  for (const [id, { total, count }] of Object.entries(groups)) {
    const avg = total / count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestId = id;
    }
  }

  // Only suggest if there's actual improvement
  if (bestAvg <= 0) return null;

  // Verify technique still exists
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  if (!allTechniques.find((t) => t.id === bestId)) return null;

  return bestId;
}

/**
 * Get an adaptive suggestion for a mood level.
 * Returns data for the component to build a localized string.
 */
export function getAdaptiveSuggestionForMood(currentMood: number): {
  techniqueId: string;
  techniqueName: string;
  moodValue: number;
} | null {
  const bestId = getBestTechniqueForMood(currentMood);
  if (!bestId) return null;

  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const technique = allTechniques.find((t) => t.id === bestId);
  if (!technique) return null;

  return {
    techniqueId: bestId,
    techniqueName: technique.name,
    moodValue: currentMood,
  };
}
