import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getSessions, getCurrentStreak, getLongestStreak } from "@/lib/storage";
import { Flame, Clock, Target, Trophy, Brain, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { checkAllBadges } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import ConsistencyCard from "@/components/stats/ConsistencyCard";
import MoodHeatmapCalendar from "@/components/stats/MoodHeatmapCalendar";
import InsightsTab from "@/components/stats/InsightsTab";

type Tab = "stats" | "insights" | "badges" | "journal" | "reports";

export default function Stats() {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<Tab>("stats");
  const sessions = useMemo(() => getSessions(), []);
  const sessionsKey = sessions.length;
  const streak = useMemo(() => getCurrentStreak(), [sessionsKey]);
  const longestStreak = useMemo(() => getLongestStreak(), [sessionsKey]);
  const totalMinutes = Math.round(sessions.reduce((s, r) => s + r.durationSeconds, 0) / 60);

  const now = new Date();
  const [reportMonth, setReportMonth] = useState(now.getMonth());
  const [reportYear, setReportYear] = useState(now.getFullYear());

  const locale = language === "bn" ? "bn" : "en";

  const avgCalmScore = useMemo(() => {
    const scored = sessions.filter((s) => s.calmScore != null);
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((sum, s) => sum + s.calmScore!, 0) / scored.length);
  }, [sessions]);

  const TIME_BUCKET_KEYS = [
    { labelKey: "stats.timeBucket.night", range: [21, 6], key: "night" },
    { labelKey: "stats.timeBucket.morning", range: [6, 9], key: "morning" },
    { labelKey: "stats.timeBucket.midday", range: [9, 12], key: "midday" },
    { labelKey: "stats.timeBucket.afternoon", range: [12, 17], key: "afternoon" },
    { labelKey: "stats.timeBucket.evening", range: [17, 21], key: "evening" },
  ];

  function getTimeBucket(hour: number) {
    if (hour >= 6 && hour < 9) return "morning";
    if (hour >= 9 && hour < 12) return "midday";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  const weeklyData = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days[key] = 0;
    }
    sessions.forEach((s) => {
      const day = s.date.split("T")[0];
      if (day in days) days[day] += Math.round(s.durationSeconds / 60);
    });
    return Object.entries(days).map(([date, minutes]) => ({
      day: new Date(date).toLocaleDateString(locale, { weekday: "short" }),
      minutes,
    }));
  }, [sessions, locale]);

  const calmTrendData = useMemo(() => {
    const scored = sessions.filter((s) => s.calmScore != null).slice(-14);
    return scored.map((s, i) => ({ session: i + 1, score: s.calmScore! }));
  }, [sessions]);

  const timeOfDayData = useMemo(() => {
    const buckets: Record<string, number> = { night: 0, morning: 0, midday: 0, afternoon: 0, evening: 0 };
    sessions.forEach((s) => {
      const hour = new Date(s.date).getHours();
      buckets[getTimeBucket(hour)]++;
    });
    return TIME_BUCKET_KEYS.map((b) => ({ name: t(b.labelKey), sessions: buckets[b.key] }));
  }, [sessions, t]);

  const journalSessions = useMemo(() => {
    return sessions.filter((s) => s.journal).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions]);

  const reportData = useMemo(() => {
    const monthSessions = sessions.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === reportMonth && d.getFullYear() === reportYear;
    });
    const totalMin = Math.round(monthSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
    const techniqueCount: Record<string, { name: string; count: number }> = {};
    monthSessions.forEach((s) => {
      if (!techniqueCount[s.techniqueId]) techniqueCount[s.techniqueId] = { name: s.techniqueName, count: 0 };
      techniqueCount[s.techniqueId].count++;
    });
    const topTechnique = Object.values(techniqueCount).sort((a, b) => b.count - a.count)[0] || null;
    const scored = monthSessions.filter((s) => s.calmScore != null);
    const avgCalm = scored.length > 0 ? Math.round(scored.reduce((sum, s) => sum + s.calmScore!, 0) / scored.length) : null;

    const dates = [...new Set(monthSessions.map((s) => s.date.split("T")[0]))].sort();
    let mStreak = dates.length > 0 ? 1 : 0;
    let cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
      if (diff === 1) { cur++; mStreak = Math.max(mStreak, cur); } else cur = 1;
    }

    return { sessions: monthSessions.length, totalMin, topTechnique, avgCalm, streak: mStreak };
  }, [sessions, reportMonth, reportYear]);

  const { unlocked, locked } = useMemo(() => checkAllBadges(sessions), [sessionsKey]);

  const monthLabel = new Date(reportYear, reportMonth).toLocaleDateString(locale, { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (reportMonth === 0) { setReportMonth(11); setReportYear(reportYear - 1); }
    else setReportMonth(reportMonth - 1);
  };
  const nextMonth = () => {
    if (reportMonth === 11) { setReportMonth(0); setReportYear(reportYear + 1); }
    else setReportMonth(reportMonth + 1);
  };

  const tabLabels: Record<Tab, string> = {
    stats: t("stats.overview"),
    insights: t("stats.insights"),
    badges: t("stats.badges"),
    journal: t("stats.journal"),
    reports: t("stats.reports"),
  };

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-2xl font-bold text-foreground">{t("stats.title")}</h1>

        <div className="mb-6 flex gap-1 rounded-xl bg-secondary p-1">
          {(["stats", "insights", "badges", "journal", "reports"] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                tab === tabKey ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {tabLabels[tabKey]}
            </button>
          ))}
        </div>

        {tab === "stats" && (
          <>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{t("stats.emptyTitle")}</h2>
                <p className="max-w-xs text-sm text-muted-foreground">{t("stats.emptyDesc")}</p>
              </div>
            ) : (
            <>
            <ConsistencyCard />

            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { icon: Flame, value: streak, label: t("stats.currentStreak"), suffix: t("stats.days"), span: false },
                { icon: Trophy, value: longestStreak, label: t("stats.longestStreak"), suffix: t("stats.days"), span: false },
                { icon: Clock, value: totalMinutes, label: t("stats.totalTime"), suffix: t("stats.min"), span: false },
                { icon: Target, value: sessions.length, label: t("stats.sessions"), suffix: "", span: false },
                ...(avgCalmScore !== null
                  ? [{ icon: Brain, value: avgCalmScore, label: t("stats.avgCalm"), suffix: "%", span: true }]
                  : []),
              ].map(({ icon: Icon, value, label, suffix, span }) => (
                <div key={label} className={`flex flex-col items-center rounded-2xl border border-border bg-card p-4 ${span ? "col-span-2" : ""}`}>
                  <Icon className="mb-1 h-5 w-5 text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    {value}{suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("stats.thisWeek")}</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mb-6 rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("stats.timeOfDay")}</h2>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={timeOfDayData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="sessions" fill="hsl(var(--primary) / 0.7)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {calmTrendData.length >= 2 && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-4">
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("stats.calmTrend")}</h2>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={calmTrendData}>
                    <XAxis dataKey="session" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <MoodHeatmapCalendar />
            </>
            )}
          </>
        )}

        {tab === "insights" && <InsightsTab />}

        {tab === "badges" && (
          <div className="space-y-6">
            {unlocked.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("stats.unlocked", { count: unlocked.length })}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {unlocked.map((b) => {
                    const badgeName = t(`badge.${b.id}.name`);
                    const badgeDesc = t(`badge.${b.id}.description`);
                    return (
                      <div key={b.id} className="flex flex-col items-center gap-1.5 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                        <span className="text-3xl">{b.emoji}</span>
                        <span className="text-xs font-semibold text-foreground text-center leading-tight">{badgeName !== `badge.${b.id}.name` ? badgeName : b.name}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{badgeDesc !== `badge.${b.id}.description` ? badgeDesc : b.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {locked.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("stats.locked", { count: locked.length })}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {locked.map((b) => {
                    const badgeName = t(`badge.${b.id}.name`);
                    const badgeDesc = t(`badge.${b.id}.description`);
                    return (
                      <div key={b.id} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 opacity-50 grayscale">
                        <span className="text-3xl">{b.emoji}</span>
                        <span className="text-xs font-semibold text-foreground text-center leading-tight">{badgeName !== `badge.${b.id}.name` ? badgeName : b.name}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{badgeDesc !== `badge.${b.id}.description` ? badgeDesc : b.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "journal" && (
          <div className="space-y-3">
            {journalSessions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("stats.noJournal")}</p>
              </div>
            ) : (
              journalSessions.map((s) => {
                const d = new Date(s.date);
                return (
                  <div key={s.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        {d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{s.techniqueName}</span>
                      <span>·</span>
                      <span>{Math.round(s.durationSeconds / 60)} {t("common.min")}</span>
                      {s.calmScore != null && (
                        <>
                          <span>·</span>
                          <span>{t("session.calmScore")} {s.calmScore}%</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{s.journal}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
              <button onClick={prevMonth} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
              <button onClick={nextMonth} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {reportData.sessions === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Target className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{t("stats.noSessions", { month: monthLabel })}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {t("stats.report.summary", { minutes: reportData.totalMin, sessions: reportData.sessions, month: monthLabel })
                    .split(String(reportData.totalMin))
                    .flatMap((part, i, arr) => i < arr.length - 1 ? [part, <strong key={`min-${i}`}>{reportData.totalMin}</strong>] : [part])
                  }
                </p>
                {reportData.topTechnique && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {t("stats.report.topTechnique", { name: reportData.topTechnique.name, count: reportData.topTechnique.count })}
                  </p>
                )}
                {reportData.streak > 0 && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {t("stats.report.streak", { days: reportData.streak })}
                  </p>
                )}
                {reportData.avgCalm !== null && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {t("stats.report.avgCalm", { score: reportData.avgCalm })}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex flex-col items-center rounded-xl bg-secondary/50 p-3">
                    <span className="text-lg font-bold text-foreground">{reportData.sessions}</span>
                    <span className="text-xs text-muted-foreground">{t("stats.report.sessions")}</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-secondary/50 p-3">
                    <span className="text-lg font-bold text-foreground">{reportData.totalMin}</span>
                    <span className="text-xs text-muted-foreground">{t("stats.report.minutes")}</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-secondary/50 p-3">
                    <span className="text-lg font-bold text-foreground">{reportData.streak}</span>
                    <span className="text-xs text-muted-foreground">{t("stats.report.streakDays")}</span>
                  </div>
                  {reportData.avgCalm !== null && (
                    <div className="flex flex-col items-center rounded-xl bg-secondary/50 p-3">
                      <span className="text-lg font-bold text-foreground">{reportData.avgCalm}%</span>
                      <span className="text-xs text-muted-foreground">{t("stats.report.calmPercent")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
