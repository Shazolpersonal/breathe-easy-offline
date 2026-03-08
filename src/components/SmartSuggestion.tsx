import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSmartSuggestion, getSuggestionTechnique } from "@/lib/suggestions";
import { getAdaptiveSuggestionForMood } from "@/lib/mood";
import { PRESET_TECHNIQUES } from "@/lib/techniques";
import { getCustomTechniques } from "@/lib/storage";
import MoodPicker from "@/components/MoodPicker";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SmartSuggestion() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const adaptive = selectedMood !== null ? getAdaptiveSuggestionForMood(selectedMood) : null;

  const fallback = getSmartSuggestion();
  const fallbackTechnique = getSuggestionTechnique(fallback);

  const techniqueId = adaptive ? adaptive.techniqueId : fallbackTechnique.id;
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const technique = allTechniques.find((tech) => tech.id === techniqueId) || PRESET_TECHNIQUES[0];

  // Build translated message
  const message = adaptive
    ? t("suggestion.adaptive", {
        mood: t(`mood.${selectedMood}`).toLowerCase(),
        technique: t(`technique.${technique.id}.name`),
      })
    : t(fallback.messageKey, fallback.messageParams);

  const handleStart = () => {
    const moodParam = selectedMood !== null ? `&mood=${selectedMood}` : "";
    navigate(`/session?technique=${technique.id}${moodParam}`);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {/* Mood picker */}
      <div className="mb-3">
        <MoodPicker
          selected={selectedMood}
          onSelect={setSelectedMood}
          label={t("mood.howFeeling")}
          compact
        />
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground">{message}</p>
          {adaptive && (
            <p className="mt-0.5 text-xs text-muted-foreground">{t("home.basedOnSessions")}</p>
          )}
          <Button size="sm" className="mt-3" onClick={handleStart}>
            {t("suggestion.start", { technique: t(`technique.${technique.id}.name`) })}
          </Button>
        </div>
      </div>
    </div>
  );
}
