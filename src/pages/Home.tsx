import { useNavigate } from "react-router-dom";
import { Wind, Flame, Zap, TrendingUp, CheckCircle2, Circle, Swords, Quote, Trophy, Share2, Heart, Play } from "lucide-react";
import SmartSuggestion from "@/components/SmartSuggestion";
import TechniqueCard from "@/components/TechniqueCard";
import WeeklySummary from "@/components/WeeklySummary";
import { PRESET_TECHNIQUES, getTechniqueById } from "@/lib/techniques";
import { getCustomTechniques, getFavorites, toggleFavorite, getCurrentStreak, getTodayMinutes, getLastSessionConfig } from "@/lib/storage";
import { getAllProgressionsPublic, getProgression } from "@/lib/progression";
import { useSettings } from "@/contexts/SettingsContext";
import { getDailyChallenges, getChallengeStreak, saveTodayChallengeProgress, areAllChallengesComplete } from "@/lib/challenges";
import { getXPState, getWeeklyXP, addXP } from "@/lib/xp";
import { getDailyQuote } from "@/lib/quotes";
import { getActiveChallenges, getChallengeProgress } from "@/lib/friendChallenge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateChallengeDialog } from "@/components/FriendChallenge";
import { toast } from "sonner";
import { shareQuote } from "@/lib/shareApp";
import DonateDialog from "@/components/DonateDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Home() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { settings } = useSettings();
  const [favorites, setFavorites] = useState(getFavorites);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const streak = useMemo(() => getCurrentStreak(), []);
  const todayMin = useMemo(() => getTodayMinutes(), []);
  const dailyGoal = settings.dailyGoalMinutes;
  const goalProgress = Math.min(100, Math.round((todayMin / dailyGoal) * 100));
  const allTechniques = useMemo(() => [...PRESET_TECHNIQUES, ...getCustomTechniques()], []);
  const progressions = useMemo(() => getAllProgressionsPublic(), [favorites]);
  const totalSessions = useMemo(() => progressions.reduce((sum, p) => sum + p.sessionsCompleted, 0), [progressions]);

  const progressionMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof getProgression>> = {};
    for (const tech of allTechniques) {
      if (favorites.includes(tech.id)) {
        const found = progressions.find(p => p.techniqueId === tech.id);
        map[tech.id] = found || { techniqueId: tech.id, level: 1, sessionsCompleted: 0, totalCycles: 0 };
      }
    }
    return map;
  }, [allTechniques, progressions, favorites]);

  const favTechniques = useMemo(() => allTechniques.filter((tech) => favorites.includes(tech.id)), [allTechniques, favorites]);
  const xpState = useMemo(() => getXPState(), []);
  const weeklyXP = useMemo(() => getWeeklyXP(), []);
  const dailyChallenges = useMemo(() => getDailyChallenges(), []);
  const challengeStreak = useMemo(() => getChallengeStreak(), []);
  const dailyQuote = useMemo(() => getDailyQuote(language), [language]);
  const activeFriendChallenges = useMemo(() => getActiveChallenges(), []);
  const allCompleteToastShown = useRef(false);
  const lastSession = useMemo(() => getLastSessionConfig(), []);

  // Save challenge progress & show all-complete celebration (run once on mount)
  useEffect(() => {
    saveTodayChallengeProgress();
    if (areAllChallengesComplete() && !allCompleteToastShown.current) {
      allCompleteToastShown.current = true;
      const bonusKey = `breathe_challenge_bonus_${new Date().toISOString().substring(0, 10)}`;
      if (!localStorage.getItem(bonusKey)) {
        addXP(25, "challenge_bonus");
        localStorage.setItem(bonusKey, "1");
        toast.success(t("challenge.allComplete"));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate time until daily reset (midnight)
  const timeUntilReset = useMemo(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return { hours, minutes };
  }, []);

  const completedCount = useMemo(() => dailyChallenges.filter(c => c.getProgress() >= c.target).length, [dailyChallenges]);

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
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Muhurto Breath logo" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-foreground">{t("home.appName")}</h1>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowDonateDialog(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={t("donate.supportUs")}
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("donate.supportUs")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-medium">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-1 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`rounded-full px-2.5 py-1 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 ${language === "bn" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                বাং
              </button>
            </div>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{greeting} {t("home.subtitle")}</p>
        </div>


        {/* Daily Quote */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
            <div className="flex-1 min-w-0">
              <p className="text-sm italic text-foreground/80 leading-relaxed">"{dailyQuote.text}"</p>
              <p className="mt-1 text-xs text-muted-foreground">— {dailyQuote.author}</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => shareQuote(dailyQuote.text, dailyQuote.author, language)}
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={t("share.quote")}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("share.quote")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stats Row with Daily Goal Ring */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3">
            <Flame className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-foreground">{streak}</span>
            <span className="text-[10px] text-muted-foreground">{t("home.dayStreak")}</span>
          </div>

          {/* Daily Goal Progress Ring */}
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3">
            <div className="relative h-12 w-12">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke={goalProgress >= 100 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"}
                  strokeWidth="3"
                  strokeDasharray={`${(goalProgress / 100) * 100.5} 100.5`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <Wind className="absolute inset-0 m-auto h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground">{todayMin}/{dailyGoal}{t("home.minToday")}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-foreground">Lv.{xpState.level}</span>
            <span className="text-[10px] text-muted-foreground">{t(`xp.${xpState.title}`)}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{xpState.totalXP} XP</span>
            <div className="flex items-center gap-2">
              {weeklyXP > 0 && (
                <span className="text-xs text-primary font-medium">{t("xp.weeklyXP", { xp: weeklyXP })}</span>
              )}
              {xpState.xpToNext > 0 && (
                <span className="text-xs text-muted-foreground">{t("home.xpToNext", { xp: xpState.xpToNext })}</span>
              )}
            </div>
          </div>
          <Progress value={xpState.xpProgress} className="h-1.5" />
        </div>

        {/* Daily Challenges */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t("home.dailyChallenges")}</h2>
              {challengeStreak >= 2 && (
                <p className="text-xs text-primary font-medium mt-0.5">
                  {t("challenge.streak", { days: challengeStreak })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("challenge.completedCount", { done: completedCount, total: dailyChallenges.length })}</p>
              <p className="text-xs text-muted-foreground">{t("challenge.resetsIn", { hours: timeUntilReset.hours, minutes: timeUntilReset.minutes })}</p>
            </div>
          </div>
          <div className="space-y-3">
            {dailyChallenges.map((c) => {
              const progress = c.getProgress();
              const done = progress >= c.target;
              const pct = Math.min(100, Math.round((progress / c.target) * 100));
              const tierColor = c.tier === "hard" ? "text-destructive" : c.tier === "medium" ? "text-primary" : "text-muted-foreground";
              const barColor = done ? "bg-primary" : c.tier === "hard" ? "bg-destructive/60" : c.tier === "medium" ? "bg-primary/60" : "bg-muted-foreground/40";
              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <p className={`text-xs font-medium truncate ${done ? "text-primary" : "text-foreground"}`}>
                        {c.emoji} {t(`challenge.${c.title}`)}
                      </p>
                      <span className={`text-[10px] font-medium shrink-0 ${tierColor}`}>{t(`challenge.tier.${c.tier}`)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {Math.min(progress, c.target)}/{c.target}{c.unit ? ` ${t(`challenge.unit.${c.unit}`)}` : ""}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="ml-6 h-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Friend Challenges */}
        {activeFriendChallenges.length > 0 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">{t("challenge.friend.active")}</h2>
            <div className="space-y-3">
              {activeFriendChallenges.map((fc) => {
                const progress = getChallengeProgress(fc);
                return (
                  <div key={fc.id} className="flex items-center gap-3">
                    {progress.isComplete ? (
                      <Trophy className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Swords className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{fc.techniqueName}</p>
                      <p className="text-[10px] text-muted-foreground">{t("challenge.friend.from", { name: fc.challengerName })}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
              <Swords className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{t("challenge.friend.title")}</p>
              <p className="text-xs text-muted-foreground">{t("challenge.friend.subtitle")}</p>
            </div>
          </button>
        </div>

        {/* Weekly Summary */}
        <WeeklySummary />

        {/* Smart Suggestion */}
        <SmartSuggestion />

        {/* Quick Resume */}
        {lastSession && (
          <div className="mb-6">
            <button
              onClick={() => navigate(`/session?technique=${lastSession.techniqueId}&duration=${lastSession.durationMinutes}`)}
              className="flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{t("home.quickResume")}</p>
                <p className="text-xs text-muted-foreground">{lastSession.techniqueName} · {lastSession.durationMinutes} {t("common.min")}</p>
              </div>
            </button>
          </div>
        )}

        {/* Quick Start */}
        {favTechniques.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{t("home.quickStart")}</h2>
            <div className="space-y-3">
              {favTechniques.slice(0, 4).map((tech) => (
                <TechniqueCard
                  key={tech.id}
                  technique={tech}
                  onToggleFav={() => handleToggleFav(tech.id)}
                  compact
                  progression={progressionMap[tech.id]}
                  totalSessions={totalSessions}
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
        <p className="mt-3 text-center text-xs text-muted-foreground">{t("home.tapToBreathe")}</p>
      </div>

      <CreateChallengeDialog
        open={showChallengeDialog}
        onOpenChange={setShowChallengeDialog}
      />
      <DonateDialog
        open={showDonateDialog}
        onOpenChange={setShowDonateDialog}
      />
    </div>
  );
}
