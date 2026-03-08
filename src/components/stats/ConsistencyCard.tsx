import { getConsistencyScore } from "@/lib/consistency";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ConsistencyCard() {
  const { t } = useLanguage();
  const { score, breakdown } = getConsistencyScore();

  const color =
    score >= 70 ? "hsl(var(--primary))" : score >= 40 ? "hsl(45 90% 55%)" : "hsl(0 70% 55%)";

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  const bars = [
    { label: t("stats.consistency.regularity"), value: breakdown.regularity },
    { label: t("stats.consistency.completion"), value: breakdown.completion },
    { label: t("stats.consistency.streak"), value: breakdown.streak },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
        {t("stats.consistency.title")}
      </h2>
      <div className="flex items-center gap-6">
        {/* Circular progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 48 48)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-3">
          {bars.map(({ label, value }) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold text-foreground">{value}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${value}%`, background: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
