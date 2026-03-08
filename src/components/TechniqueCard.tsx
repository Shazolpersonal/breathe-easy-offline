import { Heart, HeartOff, Play, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BreathingTechnique, getCycleDuration } from "@/lib/techniques";
import { UserProgression, getLevelName, getLevelProgress, isUnlocked, getUnlockRemaining } from "@/lib/progression";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface TechniqueCardProps {
  technique: BreathingTechnique;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  compact?: boolean;
  progression?: UserProgression;
}

const difficultyColor = {
  beginner: "bg-accent/20 text-accent",
  intermediate: "bg-primary/20 text-primary",
  advanced: "bg-destructive/20 text-destructive",
};

export default function TechniqueCard({ technique, isFavorite, onToggleFavorite, compact, progression: propProgression }: TechniqueCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const cycleSec = getCycleDuration(technique);
  const unlocked = isUnlocked(technique);
  // Bug 5: Use passed progression prop if available, fallback to direct call only in compact/standalone usage
  const progression = propProgression || { techniqueId: technique.id, level: 1, sessionsCompleted: 0, totalCycles: 0 };

  const techniqueName = t(`technique.${technique.id}.name`) !== `technique.${technique.id}.name`
    ? t(`technique.${technique.id}.name`)
    : technique.name;

  const techniqueDesc = t(`technique.${technique.id}.description`) !== `technique.${technique.id}.description`
    ? t(`technique.${technique.id}.description`)
    : technique.description;

  const translatedBenefits = technique.benefits.map((b, i) => {
    const key = `technique.${technique.id}.benefits.${i}`;
    const translated = t(key);
    return translated !== key ? translated : b;
  });

  // Bug 7: Localized level prefix
  const levelLabel = t("common.levelShort", { level: String(progression.level) });

  // Bug 2: Resolve phase labels at render time from type key
  const resolvePhaseLabel = (phase: { type: string; label: string }) => {
    // If label matches a phase type key, translate it; otherwise use as-is (for preset techniques)
    const phaseKey = `phase.${phase.type}`;
    const translated = t(phaseKey);
    return translated !== phaseKey ? translated : phase.label;
  };

  if (compact) {
    return (
      <button
        onClick={() => unlocked && navigate(`/session?technique=${technique.id}`)}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors",
          unlocked ? "hover:bg-secondary" : "opacity-50 cursor-not-allowed"
        )}
        disabled={!unlocked}
      >
        {unlocked ? <Play className="h-4 w-4 shrink-0 text-primary" /> : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{techniqueName}</p>
          <p className="text-xs text-muted-foreground">
            {unlocked ? `${cycleSec}s · ${levelLabel}` : t("techniques.moreSessionsToUnlock", { count: getUnlockRemaining(technique) })}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4", !unlocked && "opacity-60")}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{techniqueName}</h3>
            <Badge variant="secondary" className={cn("text-[10px]", difficultyColor[technique.difficulty])}>
              {t(`difficulty.${technique.difficulty}`)}
            </Badge>
            {unlocked && progression.sessionsCompleted > 0 && (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                {levelLabel}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{techniqueDesc}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {translatedBenefits.map((b) => (
              <span key={b} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                {b}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {technique.phases.map((p) => `${resolvePhaseLabel(p)} ${p.duration}s`).join(" → ")} ({cycleSec}s/{t("common.cycles")})
          </p>
          {unlocked && progression.sessionsCompleted > 0 && progression.level < 5 && (
            <div className="mt-2 flex items-center gap-2">
              <Progress value={getLevelProgress(progression)} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground">{t(`level.${getLevelName(progression.level)}`)}</span>
            </div>
          )}
        </div>
        <button onClick={onToggleFavorite} className="ml-2 shrink-0 p-1 text-muted-foreground hover:text-primary">
          {isFavorite ? <Heart className="h-5 w-5 fill-primary text-primary" /> : <HeartOff className="h-5 w-5" />}
        </button>
      </div>
      {unlocked ? (
        <button
          onClick={() => navigate(`/session?technique=${technique.id}`)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Play className="h-4 w-4" />
          {t("techniques.startSession")}
        </button>
      ) : (
        <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-muted py-2.5 text-sm font-medium text-muted-foreground">
          <Lock className="h-4 w-4" />
          {t("techniques.moreSessionsToUnlock", { count: getUnlockRemaining(technique) })}
        </div>
      )}
    </div>
  );
}
