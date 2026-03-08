import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getSessions, getCurrentStreak, getLongestStreak, deleteSession } from "@/lib/storage";
import { Flame, Clock, Target, Trophy, Brain, BookOpen, ChevronLeft, ChevronRight, Star, Calendar, Zap, TrendingUp, Share2, Search, Trash2 } from "lucide-react";
import { checkAllBadges } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import ConsistencyCard from "@/components/stats/ConsistencyCard";
import MoodHeatmapCalendar from "@/components/stats/MoodHeatmapCalendar";
import InsightsTab from "@/components/stats/InsightsTab";
import { getXPState } from "@/lib/xp";
import { getMoodRecords } from "@/lib/mood";
import { shareStreak, shareBadge } from "@/lib/shareApp";

type Tab = "stats" | "history" | "insights" | "badges" | "journal" | "reports";
type TimeRange = "7d" | "30d" | "90d";

export default function Stats() {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<Tab>("stats");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [sessions, setSessions] = useState(() => getSessions());
  const [historySearch, setHistorySearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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

  const xpState = useMemo(() => getXPState(), [sessionsKey]);

  // Lifetime stats
  const lifetimeStats = useMemo(() => {
    const uniqueDays = new Set(sessions.map(s => s.date.split("T")[0])).size;
    const totalHours = Math.round(sessions.reduce((s, r) => s + r.durationSeconds, 0) / 3600 * 10) / 10;
    const firstSession = sessions.length > 0 ? sessions.reduce((earliest, s) => s.date < earliest ? s.date : earliest, sessions[0].date) : null;
    return { uniqueDays, totalHours, firstSession, totalXP: xpState.totalXP };
  }, [sessions, xpState]);

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

  // Flexible time range chart data
  const timeRangeData = useMemo(() => {
    const rangeDays = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const today = new Date();

    if (rangeDays <= 7) {
      // Daily view
      const days: Record<string, number> = {};
      for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days[d.toISOString().split("T")[0]] = 0;
      }
      sessions.forEach((s) => {
        const day = s.date.split("T")[0];
        if (day in days) days[day] += Math.round(s.durationSeconds / 60);
      });
      return Object.entries(days).map(([date, minutes]) => ({
        label: new Date(date).toLocaleDateString(locale, { weekday: "short" }),
        minutes,
      }));
    } else {
      // Weekly aggregation
      const weeks: { start: string; end: string; minutes: number }[] = [];
      const totalWeeks = Math.ceil(rangeDays / 7);
      for (let w = totalWeeks - 1; w >= 0; w--) {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - w * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        weeks.push({
          start: weekStart.toISOString().split("T")[0],
          end: weekEnd.toISOString().split("T")[0],
          minutes: 0,
        });
      }
      sessions.forEach((s) => {
        const day = s.date.split("T")[0];
        for (const week of weeks) {
          if (day >= week.start && day <= week.end) {
            week.minutes += Math.round(s.durationSeconds / 60);
            break;
          }
        }
      });
      return weeks.map((w) => ({
        label: new Date(w.start).toLocaleDateString(locale, { month: "short", day: "numeric" }),
        minutes: w.minutes,
      }));
    }
  }, [sessions, timeRange, locale]);

  // Technique breakdown
  const techniqueBreakdown = useMemo(() => {
    const map: Record<string, { name: string; sessions: number; totalCalm: number; calmCount: number }> = {};
    sessions.forEach((s) => {
      if (!map[s.techniqueId]) map[s.techniqueId] = { name: s.techniqueName, sessions: 0, totalCalm: 0, calmCount: 0 };
      map[s.techniqueId].sessions++;
      if (s.calmScore != null) {
        map[s.techniqueId].totalCalm += s.calmScore;
        map[s.techniqueId].calmCount++;
      }
    });
    return Object.values(map)
      .map(t => ({ name: t.name, sessions: t.sessions, avgCalm: t.calmCount > 0 ? Math.round(t.totalCalm / t.calmCount) : null }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6);
  }, [sessions]);

  // Mood trend (30-day rolling)
  const moodTrendData = useMemo(() => {
    const records = getMoodRecords().filter(r => r.moodAfter != null);
    if (records.length < 2) return [];
    const dayMap: Record<string, { total: number; count: number }> = {};
    records.forEach(r => {
      const day = r.date.split("T")[0];
      if (!dayMap[day]) dayMap[day] = { total: 0, count: 0 };
      dayMap[day].total += r.moodAfter!;
      dayMap[day].count++;
    });
    const days = Object.entries(dayMap)
      .map(([date, { total, count }]) => ({ date, avg: Math.round((total / count) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
    
    // 7-day rolling average
    return days.map((d, i) => {
      const window = days.slice(Math.max(0, i - 6), i + 1);
      const rolling = Math.round(window.reduce((s, w) => s + w.avg, 0) / window.length * 10) / 10;
      return { day: new Date(d.date).toLocaleDateString(locale, { month: "short", day: "numeric" }), mood: d.avg, rolling };
    });
  }, [sessions, locale]);

  // XP history chart
  const xpChartData = useMemo(() => {
    try {
      const raw = localStorage.getItem("breathe_xp");
      if (!raw) return [];
      const store = JSON.parse(raw);
      if (!store.history || store.history.length === 0) return [];
      const dayMap: Record<string, number> = {};
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().split("T")[0]] = 0;
      }
      store.history.forEach((e: { date: string; amount: number }) => {
        if (e.date in dayMap) dayMap[e.date] += e.amount;
      });
      return Object.entries(dayMap).map(([date, xp]) => ({
        day: new Date(date).toLocaleDateString(locale, { day: "numeric" }),
        xp,
      }));
    } catch { return []; }
  }, [sessionsKey, locale]);

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

  // Report data with daily chart
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

    // Daily minutes for chart
    const daysInMonth = new Date(reportYear, reportMonth + 1, 0).getDate();
    const dailyMinutes: { day: string; minutes: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${reportYear}-${String(reportMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayMin = Math.round(monthSessions.filter(s => s.date.startsWith(dateStr)).reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
      dailyMinutes.push({ day: String(d), minutes: dayMin });
    }

    return { sessions: monthSessions.length, totalMin, topTechnique, avgCalm, streak: mStreak, dailyMinutes };
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

  const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 };

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
            {/* Lifetime Summary Card */}
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Star className="h-4 w-4 text-primary" />
                {t("stats.lifetime")}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">{sessions.length}</span>
                  <span className="text-[11px] text-muted-foreground">{t("stats.totalSessions")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">{lifetimeStats.totalHours}<span className="text-xs font-normal text-muted-foreground ml-0.5">h</span></span>
                  <span className="text-[11px] text-muted-foreground">{t("stats.totalHours")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">{lifetimeStats.uniqueDays}</span>
                  <span className="text-[11px] text-muted-foreground">{t("stats.uniqueDays")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">{lifetimeStats.totalXP}<span className="text-xs font-normal text-muted-foreground ml-0.5">XP</span></span>
                  <span className="text-[11px] text-muted-foreground">{t("stats.totalXP")}</span>
                </div>
              </div>
              {lifetimeStats.firstSession && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {t("stats.memberSince", { date: new Date(lifetimeStats.firstSession).toLocaleDateString(locale, { month: "long", year: "numeric" }) })}
                </p>
              )}
            </div>

            <ConsistencyCard />

            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { icon: Flame, value: streak, label: t("stats.currentStreak"), suffix: streak === 1 ? t("stats.day") : t("stats.days"), span: false, shareable: streak >= 3 },
                { icon: Trophy, value: longestStreak, label: t("stats.longestStreak"), suffix: longestStreak === 1 ? t("stats.day") : t("stats.days"), span: false, shareable: false },
                { icon: Clock, value: totalMinutes, label: t("stats.totalTime"), suffix: t("stats.min"), span: false },
                { icon: Target, value: sessions.length, label: t("stats.sessions"), suffix: "", span: false, shareable: false },
                ...(avgCalmScore !== null
                  ? [{ icon: Brain, value: avgCalmScore, label: t("stats.avgCalm"), suffix: "%", span: true, shareable: false }]
                  : []),
              ].map(({ icon: Icon, value, label, suffix, span, shareable }) => (
                <div key={label} className={`relative flex flex-col items-center rounded-2xl border border-border bg-card p-4 ${span ? "col-span-2" : ""}`}>
                  <Icon className="mb-1 h-5 w-5 text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    {value}{suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  {shareable && (
                    <button
                      onClick={() => shareStreak(value as number, language)}
                      className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title={t("share.streak")}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Time Range Chart */}
            <div className="mb-6 rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">{t("stats.activity")}</h2>
                <div className="flex gap-1 rounded-lg bg-secondary p-0.5">
                  {(["7d", "30d", "90d"] as TimeRange[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={cn(
                        "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                        timeRange === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      )}
                    >
                      {t(`stats.range.${r}`)}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={timeRangeData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Technique Breakdown */}
            {techniqueBreakdown.length >= 2 && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-4">
                <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("stats.techniqueBreakdown")}</h2>
                <div className="space-y-2.5">
                  {techniqueBreakdown.map((tech) => {
                    const maxSessions = techniqueBreakdown[0].sessions;
                    const pct = Math.round((tech.sessions / maxSessions) * 100);
                    return (
                      <div key={tech.name}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground truncate max-w-[60%]">{tech.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {tech.sessions} {t("stats.sessions").toLowerCase()}
                            {tech.avgCalm != null && ` · ${tech.avgCalm}%`}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6 rounded-2xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("stats.timeOfDay")}</h2>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={timeOfDayData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
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
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Mood Trend */}
            {moodTrendData.length >= 3 && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {t("stats.moodTrend")}
                </h2>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={moodTrendData}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 5]} hide />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary) / 0.4)" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="rolling" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="mt-1 text-[10px] text-muted-foreground text-center">{t("stats.moodTrendDesc")}</p>
              </div>
            )}

            {/* XP Chart */}
            {xpChartData.some(d => d.xp > 0) && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  {t("stats.xpEarned")}
                </h2>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={xpChartData}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="xp" fill="hsl(var(--primary) / 0.6)" radius={[4, 4, 0, 0]} />
                  </BarChart>
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
                      <div key={b.id} className="relative flex flex-col items-center gap-1.5 rounded-2xl border border-primary/20 bg-primary/5 p-3">
                        <button
                          onClick={() => shareBadge(badgeName !== `badge.${b.id}.name` ? badgeName : b.name, b.emoji, language)}
                          className="absolute top-1.5 right-1.5 rounded-full p-1 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-colors"
                          title={t("share.badge")}
                        >
                          <Share2 className="h-3 w-3" />
                        </button>
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
                    const prog = b.progress(sessions);
                    const pct = prog.target > 0 ? Math.round((prog.current / prog.target) * 100) : 0;
                    return (
                      <div key={b.id} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3">
                        <span className="text-3xl grayscale opacity-50">{b.emoji}</span>
                        <span className="text-xs font-semibold text-foreground text-center leading-tight opacity-60">{badgeName !== `badge.${b.id}.name` ? badgeName : b.name}</span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">{badgeDesc !== `badge.${b.id}.description` ? badgeDesc : b.description}</span>
                        <div className="w-full mt-1">
                          <Progress value={pct} className="h-1.5" />
                          <span className="text-[9px] text-muted-foreground mt-0.5 block text-center">{prog.current}/{prog.target}</span>
                        </div>
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
                  {(() => {
                    const summary = t("stats.report.summary", { minutes: reportData.totalMin, sessions: reportData.sessions, month: monthLabel });
                    const boldValues = [String(reportData.totalMin), String(reportData.sessions)];
                    const regex = new RegExp(`(${boldValues.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
                    const parts = summary.split(regex);
                    return parts.map((part, i) => boldValues.includes(part) ? <strong key={i}>{part}</strong> : part);
                  })()}
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

                {/* Daily Minutes Chart */}
                <div className="pt-2">
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground">{t("stats.report.dailyChart")}</h3>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={reportData.dailyMinutes}>
                      <XAxis dataKey="day" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="minutes" fill="hsl(var(--primary) / 0.6)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

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
