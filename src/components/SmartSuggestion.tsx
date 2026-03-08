import { useState } from "react";
import { Sparkles, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSmartSuggestion, getSuggestionTechnique } from "@/lib/suggestions";
import { getAdaptiveSuggestionForMood } from "@/lib/mood";
import { getAdaptiveSession } from "@/lib/adaptive";
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
  const autoAdaptive = getAdaptiveSession(selectedMood);

  const fallback = getSmartSuggestion();
  const fallbackTechnique = getSuggestionTechnique(fallback);

  const techniqueId = adaptive ? adaptive.techniqueId : fallbackTechnique.id;
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const technique = allTechniques.find((tech) => tech.id === techniqueId) || PRESET_TECHNIQUES[0];

  // Auto-adaptive technique (separate from mood-based)
  const autoTechnique = autoAdaptive
    ? allTechniques.find((tech) => tech.id === autoAdaptive.techniqueId) || null
    : null;

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

  const handleAutoStart = () => {
    if (!autoAdaptive) return;
    const moodParam = selectedMood !== null ? `&mood=${selectedMood}` : "";
    navigate(`/session?technique=${autoAdaptive.techniqueId}&duration=${autoAdaptive.durationMinutes}${moodParam}`);
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

      {/* Auto-adaptive session card */}
      {autoAdaptive && autoTechnique && (
        <div className="mb-3 flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Brain className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary">{t("adaptive.smartSession")}</p>
            <p className="text-sm text-foreground">
              {t(`technique.${autoTechnique.id}.name`)} · {autoAdaptive.durationMinutes} {t("common.min")}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t(autoAdaptive.reasonKey, autoAdaptive.reasonParams)}
            </p>
            <Button size="sm" className="mt-2 gap-1" onClick={handleAutoStart}>
              <Brain className="h-3.5 w-3.5" />
              {t("adaptive.startSmart")}
            </Button>
          </div>
        </div>
      )}

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
