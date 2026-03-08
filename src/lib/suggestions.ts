import { PRESET_TECHNIQUES, BreathingTechnique } from "./techniques";
import { getTodayMinutes, getCurrentStreak } from "./storage";

interface Suggestion {
  message: string;
  techniqueId: string;
}

export function getSmartSuggestion(): Suggestion {
  const hour = new Date().getHours();
  const todayMin = getTodayMinutes();
  const streak = getCurrentStreak();

  // Morning (5-11)
  if (hour >= 5 && hour < 12) {
    if (todayMin === 0) {
      return {
        message: "Good morning! Start your day with energizing breath work.",
        techniqueId: "equal-breathing",
      };
    }
    return {
      message: "Great start! Keep the momentum going.",
      techniqueId: "box-breathing",
    };
  }

  // Afternoon (12-17)
  if (hour >= 12 && hour < 17) {
    if (todayMin === 0) {
      return {
        message: "Afternoon reset — a quick session boosts focus.",
        techniqueId: "box-breathing",
      };
    }
    return {
      message: `${todayMin} min today! Try a calming technique next.`,
      techniqueId: "calm-breath",
    };
  }

  // Evening (17-22)
  if (hour >= 17 && hour < 22) {
    return {
      message: "Wind down for the evening with relaxing breath work.",
      techniqueId: "4-7-8",
    };
  }

  // Night (22-5)
  return {
    message: "Can't sleep? The 4-7-8 technique is a natural sleep aid.",
    techniqueId: "4-7-8",
  };
}

export function getSuggestionTechnique(suggestion: Suggestion): BreathingTechnique {
  return PRESET_TECHNIQUES.find((t) => t.id === suggestion.techniqueId) || PRESET_TECHNIQUES[0];
}
