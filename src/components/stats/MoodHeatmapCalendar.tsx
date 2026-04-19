import { useMemo, useState } from "react";
import { getSessions } from "@/lib/storage";
import { getMoodRecords, getMoodEmoji } from "@/lib/mood";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MoodHeatmapCalendar() {
  const { t, language } = useLanguage();
  const locale = language === "bn" ? "bn" : "en";
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const sessions = useMemo(() => getSessions(), []);
  const moodRecords = useMemo(() => getMoodRecords(), []);

  const dayKeys = ["day.sun", "day.mon", "day.tue", "day.wed", "day.thu", "day.fri", "day.sat"];

  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { day: number; dateKey: string; sessions: typeof sessions; avgMood: number | null; sessionCount: number }[] = [];

    // Optimization: Pre-compute hash maps for sessions and moods by day to turn an O(N * M) filtering loop into O(N + M) lookups.
    // .substring(0, 10) extracts the 'YYYY-MM-DD' part assuming ISO dates.
    const sessionMap: Record<string, typeof sessions> = {};
    sessions.forEach(s => {
      const dateKey = s.date.substring(0, 10);
      if (!sessionMap[dateKey]) sessionMap[dateKey] = [];
      sessionMap[dateKey].push(s);
    });

    const moodMap: Record<string, typeof moodRecords> = {};
    moodRecords.forEach(r => {
      if (r.moodAfter === null) return;
      const dateKey = r.date.substring(0, 10);
      if (!moodMap[dateKey]) moodMap[dateKey] = [];
      moodMap[dateKey].push(r);
    });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      // Dictionary lookup replaces .filter() iteration
      const daySessions = sessionMap[dateKey] || [];
      const dayMoodRecords = moodMap[dateKey] || [];

      let avgMood: number | null = null;
      if (dayMoodRecords.length > 0) {
        avgMood = dayMoodRecords.reduce((sum, r) => sum + r.moodAfter!, 0) / dayMoodRecords.length;
      }

      cells.push({ day: d, dateKey, sessions: daySessions, avgMood, sessionCount: daySessions.length });
    }

    return { firstDay, daysInMonth, cells };
  }, [sessions, moodRecords, month, year]);

  const monthLabel = new Date(year, month).toLocaleDateString(locale, { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
    setSelectedDay(null);
  };

  function getMoodColor(avgMood: number | null, hasSession: boolean): string {
    if (!hasSession) return "hsl(var(--muted))";
    if (avgMood === null) return "hsl(var(--primary) / 0.25)";
    if (avgMood <= 1.5) return "hsl(0 70% 50%)";
    if (avgMood <= 2.5) return "hsl(25 80% 55%)";
    if (avgMood <= 3.5) return "hsl(45 85% 55%)";
    if (avgMood <= 4.5) return "hsl(120 50% 45%)";
    return "hsl(150 60% 40%)";
  }

  const selectedData = selectedDay ? calendarData.cells.find((c) => c.dateKey === selectedDay) : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={t("stats.prevMonth")}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold text-foreground">{monthLabel}</h2>
        <button onClick={nextMonth} className="rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={t("stats.nextMonth")}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayKeys.map((key) => (
          <div key={key} className="text-center text-[10px] font-medium text-muted-foreground">
            {t(key)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: calendarData.firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 w-full" />
        ))}
        {calendarData.cells.map((cell) => {
          const todayLocal = (() => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          })();
          const isToday = cell.dateKey === todayLocal;
          return (
            <button
              key={cell.day}
              onClick={() => setSelectedDay(cell.dateKey === selectedDay ? null : cell.dateKey)}
              className={`relative flex h-9 w-full flex-col items-center justify-center rounded-lg text-xs transition-all ${
                cell.dateKey === selectedDay ? "ring-2 ring-primary" : ""
              } ${isToday ? "font-bold" : ""}`}
              style={{ background: getMoodColor(cell.avgMood, cell.sessionCount > 0) }}
            >
              <span className={cell.sessionCount > 0 ? "text-white" : "text-muted-foreground"}>
                {cell.day}
              </span>
              {cell.sessionCount > 0 && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {Array.from({ length: Math.min(cell.sessionCount, 3) }).map((_, i) => (
                    <div key={i} className="h-1 w-1 rounded-full bg-white/70" />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day popover */}
      {selectedData && selectedData.sessionCount > 0 && (
        <div className="mt-3 rounded-xl border border-border bg-secondary/50 p-3 space-y-1.5">
          <div className="text-xs font-semibold text-foreground">
            {new Date(selectedData.dateKey).toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" })}
          </div>
          <div className="text-xs text-muted-foreground">
            {selectedData.sessionCount} {t("common.sessions")} · {Math.round(selectedData.sessions.reduce((s, r) => s + r.durationSeconds, 0) / 60)} {t("common.min")}
          </div>
          {selectedData.avgMood !== null && (
            <div className="text-xs text-muted-foreground">
              {t("stats.heatmap.avgMood")}: {getMoodEmoji(Math.round(selectedData.avgMood))} {selectedData.avgMood.toFixed(1)}/5
            </div>
          )}
          {selectedData.sessions.map((s) => (
            <div key={s.id} className="text-[11px] text-muted-foreground">
              {s.techniqueName} · {Math.round(s.durationSeconds / 60)} {t("common.min")}
              {s.calmScore != null && ` · ${t("session.calmScore")} ${s.calmScore}%`}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
        <span>{t("stats.heatmap.legend")}:</span>
        {[
          { label: "😫", color: "hsl(0 70% 50%)" },
          { label: "😟", color: "hsl(25 80% 55%)" },
          { label: "😐", color: "hsl(45 85% 55%)" },
          { label: "🙂", color: "hsl(120 50% 45%)" },
          { label: "😌", color: "hsl(150 60% 40%)" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-0.5">
            <div className="h-3 w-3 rounded-sm" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
