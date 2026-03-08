import { useNavigate } from "react-router-dom";
import { Wind, Flame, Zap, TrendingUp, CheckCircle2, Circle, Swords, Quote } from "lucide-react";
import SmartSuggestion from "@/components/SmartSuggestion";
import TechniqueCard from "@/components/TechniqueCard";
import { PRESET_TECHNIQUES } from "@/lib/techniques";
import { getCustomTechniques, getFavorites, toggleFavorite, getCurrentStreak, getTodayMinutes } from "@/lib/storage";
import { getDailyChallenges } from "@/lib/challenges";
import { getXPState } from "@/lib/xp";
import { getDailyQuote } from "@/lib/quotes";
import { getActiveChallenges, getChallengeProgress } from "@/lib/friendChallenge";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateChallengeDialog } from "@/components/FriendChallenge";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState(getFavorites);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const streak = getCurrentStreak();
  const todayMin = getTodayMinutes();
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const favTechniques = allTechniques.filter((t) => favorites.includes(t.id));
  const xpState = getXPState();
  const dailyChallenges = useMemo(() => getDailyChallenges(), []);
  const dailyQuote = useMemo(() => getDailyQuote(), []);
  const activeFriendChallenges = useMemo(() => getActiveChallenges(), []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("home.greeting.morning") : hour < 17 ? t("home.greeting.afternoon") : hour < 22 ? t("home.greeting.evening") : t("home.greeting.night");

  const handleToggleFav = (id: string) => {
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo.png" alt="Muhurto Breath logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-foreground">{t("home.appName")}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{greeting} {t("home.subtitle")}</p>
        </div>

        {/* Daily Quote */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
            <div>
              <p className="text-sm italic text-foreground/80 leading-relaxed">"{dailyQuote.text}"</p>
              <p className="mt-1.5 text-xs text-muted-foreground">— {dailyQuote.author}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-3">
            <Flame className="mb-1 h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{streak}</span>
            <span className="text-[11px] text-muted-foreground">{t("home.dayStreak")}</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-3">
            <Wind className="mb-1 h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{todayMin}</span>
            <span className="text-[11px] text-muted-foreground">{t("home.minToday")}</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-3">
            <Zap className="mb-1 h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">Lv.{xpState.level}</span>
            <span className="text-[11px] text-muted-foreground">{t(`xp.${xpState.title}`)}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">{xpState.totalXP} XP</span>
            {xpState.xpToNext > 0 && (
              <span className="text-xs text-muted-foreground">{t("home.xpToNext", { xp: xpState.xpToNext })}</span>
            )}
          </div>
          <Progress value={xpState.progressToNext} className="h-2" />
        </div>

        {/* Daily Challenges */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("home.dailyChallenges")}</h2>
          <div className="space-y-2.5">
            {dailyChallenges.map((c) => {
              const progress = c.getProgress();
              const done = progress >= c.target;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${done ? "text-primary font-medium line-through" : "text-foreground"}`}>
                      {c.emoji} {t(`challenge.${c.title}`)}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {Math.min(progress, c.target)}/{c.target}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Friend Challenges */}
        {activeFriendChallenges.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("challenge.friend.active")}
            </h2>
            <div className="space-y-2.5">
              {activeFriendChallenges.map((fc) => {
                const progress = getChallengeProgress(fc);
                return (
                  <div key={fc.id} className="flex items-center gap-3">
                    {progress.isComplete ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <Swords className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${progress.isComplete ? "text-primary font-medium line-through" : "text-foreground"}`}>
                        {fc.techniqueName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        {t("challenge.friend.from", { name: fc.challengerName })}
                      </span>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {fc.targetMinutes > 0 && `${progress.minutesDone}/${fc.targetMinutes}m`}
                      {fc.targetMinutes > 0 && fc.targetCycles > 0 && " · "}
                      {fc.targetCycles > 0 && `${progress.cyclesDone}/${fc.targetCycles}c`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Challenge a Friend Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowChallengeDialog(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Swords className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{t("challenge.friend.title")}</p>
              <p className="text-xs text-muted-foreground">{t("challenge.friend.subtitle")}</p>
            </div>
          </button>
        </div>

        {/* Smart Suggestion */}
        <div className="mb-6">
          <SmartSuggestion />
        </div>

        {/* Quick Start */}
        {favTechniques.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("home.quickStart")}</h2>
            <div className="grid grid-cols-2 gap-2">
              {favTechniques.slice(0, 4).map((tech) => (
                <TechniqueCard
                  key={tech.id}
                  technique={tech}
                  isFavorite={true}
                  onToggleFavorite={() => handleToggleFav(tech.id)}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Big Breathe button */}
        <button
          onClick={() => navigate("/session")}
          className="group relative mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-transform hover:scale-105"
          style={{
            background: `radial-gradient(circle at 35% 35%, hsl(var(--breathe-glow)), hsl(var(--breathe-glow-secondary)))`,
            boxShadow: `0 0 30px 8px hsl(var(--breathe-glow) / 0.3)`,
          }}
        >
          <Wind className="h-8 w-8 text-primary-foreground" />
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">{t("home.tapToBreathe")}</p>
      </div>

      <CreateChallengeDialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog} />
    </div>
  );
}
