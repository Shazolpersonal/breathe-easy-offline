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
