import { useMemo } from "react";
import { getWeeklyInsights } from "@/lib/insights";
import { Lightbulb, TrendingUp, Flame, Clock, Award, BarChart3, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const INSIGHT_ICONS: Record<string, typeof Lightbulb> = {
  "insight.bestTime": Clock,
  "insight.techniqueCompare": BarChart3,
  "insight.bestTechnique": Award,
  "insight.nearRecord": Flame,
  "insight.onRecord": Award,
  "insight.moreSessionsUp": TrendingUp,
  "insight.fewerSessions": TrendingUp,
  "insight.durationUp": Zap,
  "insight.noSessions": Lightbulb,
  "insight.goodStart": Lightbulb,
  "insight.streakGoing": Flame,
};

function getInsightKey(raw: string): string {
  return raw.split("|")[0];
}

function getInsightParams(raw: string): string[] {
  return raw.split("|").slice(1);
}

export default function InsightsTab() {
  const { t } = useLanguage();

  const insights = useMemo(() => getWeeklyInsights(), []);

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Lightbulb className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{t("stats.insights.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-2">{t("stats.insights.subtitle")}</p>
      {insights.map((raw, i) => {
        const key = getInsightKey(raw);
        const params = getInsightParams(raw);
        const Icon = INSIGHT_ICONS[key] || Lightbulb;

        // Build translated text with params
        let text: string;
        switch (key) {
          case "insight.bestTime":
            text = t("insight.bestTime", { time: params[0] });
            break;
          case "insight.techniqueCompare":
            text = t("insight.techniqueCompare", { best: params[0], pct: params[1], second: params[2] });
            break;
          case "insight.bestTechnique":
            text = t("insight.bestTechnique", { name: params[0] });
            break;
          case "insight.nearRecord":
            text = t("insight.nearRecord", { days: params[0] });
            break;
          case "insight.moreSessionsUp":
            text = t("insight.moreSessionsUp", { count: params[0] });
            break;
          case "insight.fewerSessions":
            text = t("insight.fewerSessions", { count: params[0] });
            break;
          case "insight.durationUp":
            text = t("insight.durationUp", { current: params[0], previous: params[1] });
            break;
          case "insight.streakGoing":
            text = t("insight.streakGoing", { days: params[0] });
            break;
          default:
            text = t(key);
        }

        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm leading-relaxed text-foreground">{text}</p>
          </div>
        );
      })}
    </div>
  );
}
