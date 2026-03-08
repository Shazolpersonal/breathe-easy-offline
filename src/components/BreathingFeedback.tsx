import { useLanguage } from "@/contexts/LanguageContext";
import { Mic } from "lucide-react";

interface BreathingFeedbackProps {
  volume: number;      // 0-1
  accuracy: number;    // 0-100
  isBreathing: boolean;
}

export default function BreathingFeedback({ volume, accuracy, isBreathing }: BreathingFeedbackProps) {
  const { t } = useLanguage();

  const getAccuracyColor = () => {
    if (accuracy >= 70) return "bg-green-500";
    if (accuracy >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAccuracyLabel = () => {
    if (accuracy >= 70) return t("breath.goodSync");
    if (accuracy >= 40) return t("breath.slightlyOff");
    return t("breath.outOfSync");
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Mic className={`h-3.5 w-3.5 ${isBreathing ? "text-primary" : "text-muted-foreground"}`} />
        {/* Volume meter */}
        <div className="flex h-4 w-12 items-end gap-px">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-sm transition-all ${
                volume * 8 > i ? "bg-primary" : "bg-muted"
              }`}
              style={{ height: `${Math.max(20, ((i + 1) / 8) * 100)}%` }}
            />
          ))}
        </div>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${getAccuracyColor()}`} />
        <span className="text-xs font-medium text-foreground">{accuracy}%</span>
        <span className="text-[10px] text-muted-foreground">{getAccuracyLabel()}</span>
      </div>
    </div>
  );
}
