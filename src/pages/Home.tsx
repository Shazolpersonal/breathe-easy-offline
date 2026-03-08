import { useNavigate } from "react-router-dom";
import { Wind, Flame, Zap, TrendingUp, CheckCircle2, Circle } from "lucide-react";
import SmartSuggestion from "@/components/SmartSuggestion";
import TechniqueCard from "@/components/TechniqueCard";
import { PRESET_TECHNIQUES } from "@/lib/techniques";
import { getCustomTechniques, getFavorites, toggleFavorite, getCurrentStreak, getTodayMinutes } from "@/lib/storage";
import { getDailyChallenges } from "@/lib/challenges";
import { getXPState } from "@/lib/xp";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(getFavorites);
  const streak = getCurrentStreak();
  const todayMin = getTodayMinutes();
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const favTechniques = allTechniques.filter((t) => favorites.includes(t.id));
  const xpState = getXPState();
  const dailyChallenges = useMemo(() => getDailyChallenges(), []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : hour < 22 ? "Good Evening" : "Night Owl";

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
            <h1 className="text-2xl font-bold text-foreground">Muhurto Breath</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{greeting} — take a muhurto to breathe.</p>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-3">
            <Flame className="mb-1 h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{streak}</span>
            <span className="text-[11px] text-muted-foreground">Day Streak</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-3">
            <Wind className="mb-1 h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{todayMin}</span>
            <span className="text-[11px] text-muted-foreground">Min Today</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-3">
            <Zap className="mb-1 h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">Lv.{xpState.level}</span>
            <span className="text-[11px] text-muted-foreground">{xpState.title}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">{xpState.totalXP} XP</span>
            {xpState.xpToNext > 0 && (
              <span className="text-xs text-muted-foreground">{xpState.xpToNext} XP to next level</span>
            )}
          </div>
          <Progress value={xpState.progressToNext} className="h-2" />
        </div>

        {/* Daily Challenges */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Daily Challenges</h2>
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
                      {c.emoji} {c.title}
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

        {/* Smart Suggestion */}
        <div className="mb-6">
          <SmartSuggestion />
        </div>

        {/* Quick Start */}
        {favTechniques.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Start</h2>
            <div className="grid grid-cols-2 gap-2">
              {favTechniques.slice(0, 4).map((t) => (
                <TechniqueCard
                  key={t.id}
                  technique={t}
                  isFavorite={true}
                  onToggleFavorite={() => handleToggleFav(t.id)}
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
        <p className="mt-2 text-center text-xs text-muted-foreground">Tap to breathe</p>
      </div>
    </div>
  );
}
