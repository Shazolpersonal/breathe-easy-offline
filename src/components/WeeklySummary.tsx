import { useState, useMemo } from "react";
import { X, Flame, Clock, Zap, Brain, Star, Share2 } from "lucide-react";
import { getWeeklySummary, hasSeenWeeklySummary, markWeeklySummarySeen } from "@/lib/weeklySummary";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function WeeklySummary() {
  const { t, language } = useLanguage();
  const [dismissed, setDismissed] = useState(() => hasSeenWeeklySummary());
  const summary = useMemo(() => getWeeklySummary(), []);

  if (dismissed || !summary.hasData || summary.totalSessions < 2) return null;

  const dismiss = () => {
    markWeeklySummarySeen();
    setDismissed(true);
  };

  const handleShare = async () => {
    const text = `🧘 ${t("weekly.shareTitle")}\n📊 ${summary.totalSessions} ${t("common.sessions")} · ${summary.totalMinutes} ${t("common.min")}\n🔥 ${summary.streak} ${t("common.days")} ${t("home.dayStreak").toLowerCase()}\n⚡ ${summary.xpEarned} XP\n${summary.bestCalmScore ? `🧠 ${t("weekly.bestCalm")}: ${summary.bestCalmScore}%` : ""}\n\nmuhurto.lovable.app`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* empty */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">{t("weekly.title")}</h2>
        </div>
        <button onClick={dismiss} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 rounded-xl bg-card/60 p-2.5">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">{summary.totalMinutes} <span className="text-xs font-normal text-muted-foreground">{t("common.min")}</span></p>
            <p className="text-[10px] text-muted-foreground">{summary.totalSessions} {t("common.sessions")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card/60 p-2.5">
          <Flame className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">{summary.streak} <span className="text-xs font-normal text-muted-foreground">{t("common.days")}</span></p>
            <p className="text-[10px] text-muted-foreground">{t("home.dayStreak")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-card/60 p-2.5">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">{summary.xpEarned} <span className="text-xs font-normal text-muted-foreground">XP</span></p>
            <p className="text-[10px] text-muted-foreground">{t("weekly.earned")}</p>
          </div>
        </div>
        {summary.bestCalmScore !== null && (
          <div className="flex items-center gap-2 rounded-xl bg-card/60 p-2.5">
            <Brain className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">{summary.bestCalmScore}%</p>
              <p className="text-[10px] text-muted-foreground">{t("weekly.bestCalm")}</p>
            </div>
          </div>
        )}
      </div>

      {summary.mostUsedTechnique && (
        <p className="text-xs text-muted-foreground mb-3">
          ⭐ {t("weekly.mostUsed", { technique: summary.mostUsedTechnique })}
        </p>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={handleShare}>
          <Share2 className="h-3.5 w-3.5" /> {t("session.share")}
        </Button>
        <Button size="sm" variant="ghost" className="flex-1" onClick={dismiss}>
          {t("weekly.dismiss")}
        </Button>
      </div>
    </div>
  );
}
