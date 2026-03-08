import { useNavigate } from "react-router-dom";
import { Wind, Flame, Zap, TrendingUp, CheckCircle2, Circle, Swords, Quote, Download, X, Trophy, Share2, Heart, Play } from "lucide-react";
import SmartSuggestion from "@/components/SmartSuggestion";
import TechniqueCard from "@/components/TechniqueCard";
import WeeklySummary from "@/components/WeeklySummary";
import { PRESET_TECHNIQUES, getTechniqueById } from "@/lib/techniques";
import { getCustomTechniques, getFavorites, toggleFavorite, getCurrentStreak, getTodayMinutes, getLastSessionConfig } from "@/lib/storage";
import { useSettings } from "@/contexts/SettingsContext";
import { getDailyChallenges, getChallengeStreak, saveTodayChallengeProgress, areAllChallengesComplete } from "@/lib/challenges";
import { getXPState, getWeeklyXP, addXP } from "@/lib/xp";
import { getDailyQuote } from "@/lib/quotes";
import { getActiveChallenges, getChallengeProgress } from "@/lib/friendChallenge";
import { canInstall, promptInstall, isDismissed, dismissInstallBanner, isRunningAsPWA, canShowManualInstallHint, getInstallPlatform } from "@/lib/installPrompt";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateChallengeDialog } from "@/components/FriendChallenge";
import { toast } from "sonner";
import { shareQuote } from "@/lib/shareApp";
import DonateDialog from "@/components/DonateDialog";

export default function Home() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [favorites, setFavorites] = useState(getFavorites);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(isDismissed);
  const streak = useMemo(() => getCurrentStreak(), []);
  const todayMin = useMemo(() => getTodayMinutes(), []);
  const allTechniques = useMemo(() => [...PRESET_TECHNIQUES, ...getCustomTechniques()], []);
  const favTechniques = useMemo(() => allTechniques.filter((tech) => favorites.includes(tech.id)), [allTechniques, favorites]);
  const xpState = useMemo(() => getXPState(), []);
  const weeklyXP = useMemo(() => getWeeklyXP(), []);
  const dailyChallenges = useMemo(() => getDailyChallenges(), []);
  const challengeStreak = useMemo(() => getChallengeStreak(), []);
  const dailyQuote = useMemo(() => getDailyQuote(language), [language]);
  const activeFriendChallenges = useMemo(() => getActiveChallenges(), []);
  const isPWA = useMemo(() => isRunningAsPWA(), []);
  const showNativeInstall = canInstall() && !installDismissed;
  const showManualInstall = !isPWA && canShowManualInstallHint() && !installDismissed;
  const installPlatform = useMemo(() => getInstallPlatform(), []);
  const allCompleteToastShown = useRef(false);

  // Save challenge progress & show all-complete celebration
  useEffect(() => {
    saveTodayChallengeProgress();
    if (areAllChallengesComplete() && !allCompleteToastShown.current) {
      allCompleteToastShown.current = true;
      const bonusKey = `breathe_challenge_bonus_${new Date().toISOString().split("T")[0]}`;
      if (!localStorage.getItem(bonusKey)) {
        addXP(25, "challenge_bonus");
        localStorage.setItem(bonusKey, "1");
        toast.success(t("challenge.allComplete"));
      }
    }
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("home.greeting.morning") : hour < 17 ? t("home.greeting.afternoon") : hour < 22 ? t("home.greeting.evening") : t("home.greeting.night");

  const handleToggleFav = (id: string) => {
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

  const handleInstall = async () => {
    await promptInstall();
    setInstallDismissed(true);
  };

  const handleDismissInstall = () => {
    dismissInstallBanner();
    setInstallDismissed(true);
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
              <button
                onClick={() => setShowDonateDialog(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary hover:bg-primary/10"
                title={t("donate.supportUs")}
              >
                <Heart className="h-4 w-4" />
              </button>
            <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-medium">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-1 transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("bn")}
                className={`rounded-full px-2.5 py-1 transition-colors ${language === "bn" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                বাং
              </button>
            </div>
            </div>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{greeting} {t("home.subtitle")}</p>
        </div>

        {/* PWA Native Install Banner (Chrome/Edge) */}
        {showNativeInstall && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t("install.title")}</p>
                <p className="text-xs text-muted-foreground">{t("install.desc")}</p>
                <Button size="sm" className="mt-2 gap-1" onClick={handleInstall}>
                  <Download className="h-3.5 w-3.5" /> {t("install.button")}
                </Button>
              </div>
              <button onClick={handleDismissInstall} className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* PWA Manual Install Hint (Safari/iOS/Firefox) */}
        {showManualInstall && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t("install.manual.title")}</p>
                <p className="text-xs text-muted-foreground">
                  {installPlatform === "ios"
                    ? t("install.manual.ios")
                    : installPlatform === "android"
                    ? t("install.manual.android")
                    : t("install.manual.desktop")}
                </p>
                <p className="mt-1 text-[11px] text-primary/70">{t("install.manual.free")}</p>
              </div>
              <button onClick={handleDismissInstall} className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Daily Quote */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
            <div className="flex-1 min-w-0">
              <p className="text-sm italic text-foreground/80 leading-relaxed">"{dailyQuote.text}"</p>
              <p className="mt-1.5 text-xs text-muted-foreground">— {dailyQuote.author}</p>
            </div>
            <button
              onClick={() => shareQuote(dailyQuote.text, dailyQuote.author, language)}
              className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title={t("share.quote")}
            >
              <Share2 className="h-4 w-4" />
            </button>
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
            <div className="flex items-center gap-2">
              {weeklyXP > 0 && (
                <span className="text-xs text-primary font-medium">
                  {t("xp.weeklyXP", { xp: weeklyXP })}
                </span>
              )}
              {xpState.xpToNext > 0 && (
                <span className="text-xs text-muted-foreground">{t("home.xpToNext", { xp: xpState.xpToNext })}</span>
              )}
            </div>
          </div>
          <Progress value={xpState.progressToNext} className="h-2" />
        </div>

        {/* Daily Challenges */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("home.dailyChallenges")}</h2>
            {challengeStreak >= 2 && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                <Trophy className="h-3.5 w-3.5" />
                {t("challenge.streak", { days: challengeStreak })}
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {dailyChallenges.map((c) => {
              const progress = c.getProgress();
              const done = progress >= c.target;
              const tierColor = c.tier === "hard" ? "text-destructive" : c.tier === "medium" ? "text-primary" : "text-muted-foreground";
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
                    <span className={`ml-1.5 text-[10px] uppercase font-medium ${tierColor}`}>
                      {t(`challenge.tier.${c.tier}`)}
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
      <DonateDialog open={showDonateDialog} onOpenChange={setShowDonateDialog} />
    </div>
  );
}
