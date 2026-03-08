import { useNavigate } from "react-router-dom";
import { Wind, Flame, Zap } from "lucide-react";
import SmartSuggestion from "@/components/SmartSuggestion";
import TechniqueCard from "@/components/TechniqueCard";
import { PRESET_TECHNIQUES } from "@/lib/techniques";
import { getCustomTechniques, getFavorites, toggleFavorite, getCurrentStreak, getTodayMinutes } from "@/lib/storage";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(getFavorites);
  const streak = getCurrentStreak();
  const todayMin = getTodayMinutes();
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];
  const favTechniques = allTechniques.filter((t) => favorites.includes(t.id));

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
          <h1 className="text-2xl font-bold text-foreground">{greeting} 🌬️</h1>
          <p className="mt-1 text-sm text-muted-foreground">Take a moment to breathe.</p>
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
            <span className="text-lg font-bold text-foreground">{favTechniques.length}</span>
            <span className="text-[11px] text-muted-foreground">Favorites</span>
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
