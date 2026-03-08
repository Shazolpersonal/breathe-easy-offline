import { PRESET_TECHNIQUES, BreathingTechnique } from "./techniques";
import { getTodayMinutes, getCurrentStreak } from "./storage";

interface Suggestion {
  messageKey: string;
  messageParams?: Record<string, string | number>;
  techniqueId: string;
}

export function getSmartSuggestion(): Suggestion {
  const hour = new Date().getHours();
  const todayMin = getTodayMinutes();

  if (hour >= 5 && hour < 12) {
    if (todayMin === 0) {
      return { messageKey: "suggestion.morning.noSession", techniqueId: "equal-breathing" };
    }
    return { messageKey: "suggestion.morning.hasSession", techniqueId: "box-breathing" };
  }

  if (hour >= 12 && hour < 17) {
    if (todayMin === 0) {
      return { messageKey: "suggestion.afternoon.noSession", techniqueId: "box-breathing" };
    }
    return { messageKey: "suggestion.afternoon.hasSession", messageParams: { min: todayMin }, techniqueId: "calm-breath" };
  }

  if (hour >= 17 && hour < 22) {
    return { messageKey: "suggestion.evening", techniqueId: "4-7-8" };
  }

  return { messageKey: "suggestion.night", techniqueId: "4-7-8" };
}

export function getSuggestionTechnique(suggestion: Suggestion): BreathingTechnique {
  return PRESET_TECHNIQUES.find((t) => t.id === suggestion.techniqueId) || PRESET_TECHNIQUES[0];
}

// Post-session technique recommendation based on mood
export interface PostSessionRecommendation {
  techniqueId: string;
  techniqueName: string;
  reasonKey: string;
}

export function getPostSessionRecommendation(
  moodAfter: number | null,
  currentTechniqueId: string
): PostSessionRecommendation | null {
  if (moodAfter === null) return null;

  // Don't recommend the same technique
  const candidates = PRESET_TECHNIQUES.filter(t => t.id !== currentTechniqueId);

  let recommended: BreathingTechnique | undefined;
  let reasonKey: string;

  if (moodAfter <= 2) {
    // Still stressed/anxious → deep relaxation
    recommended = candidates.find(t => t.id === "4-7-8") || candidates.find(t => t.id === "calm-breath");
    reasonKey = "recommendation.stillStressed";
  } else if (moodAfter === 3) {
    // Neutral → energizing
    recommended = candidates.find(t => t.id === "box-breathing") || candidates.find(t => t.id === "equal-breathing");
    reasonKey = "recommendation.neutral";
  } else {
    // Good/Calm → maintenance or exploration
    recommended = candidates.find(t => t.id === "equal-breathing") || candidates.find(t => t.id === "calm-breath");
    reasonKey = "recommendation.feelingGood";
  }

  if (!recommended) return null;

  return {
    techniqueId: recommended.id,
    techniqueName: recommended.name,
    reasonKey,
  };
}
