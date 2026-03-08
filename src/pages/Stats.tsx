import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getSessions, getCurrentStreak, getLongestStreak } from "@/lib/storage";
import { Flame, Clock, Target, Trophy, Brain } from "lucide-react";

export default function Stats() {
  const sessions = getSessions();
  const streak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const totalMinutes = Math.round(sessions.reduce((s, r) => s + r.durationSeconds, 0) / 60);

  const avgCalmScore = useMemo(() => {
    const scored = sessions.filter((s) => s.calmScore != null);
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((sum, s) => sum + s.calmScore!, 0) / scored.length);
  }, [sessions]);

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
      day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      minutes,
    }));
  }, [sessions]);

  const calmTrendData = useMemo(() => {
    const scored = sessions.filter((s) => s.calmScore != null).slice(-14);
    return scored.map((s, i) => ({
      session: i + 1,
      score: s.calmScore!,
    }));
  }, [sessions]);

  const heatmapData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const count = sessions.filter((s) => s.date.startsWith(key)).length;
      days.push({ date: key, count });
    }
    return days;
  }, [sessions]);

  return (
    <div className="min-h-screen px-4 pb-24 pt-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Statistics</h1>

        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {[
            { icon: Flame, value: streak, label: "Current Streak", suffix: "days" },
            { icon: Trophy, value: longestStreak, label: "Longest Streak", suffix: "days" },
            { icon: Clock, value: totalMinutes, label: "Total Time", suffix: "min" },
            { icon: Target, value: sessions.length, label: "Sessions", suffix: "" },
            ...(avgCalmScore !== null
              ? [{ icon: Brain, value: avgCalmScore, label: "Avg Calm Score", suffix: "%" }]
              : []),
          ].map(({ icon: Icon, value, label, suffix }) => (
            <div key={label} className="flex flex-col items-center rounded-2xl border border-border bg-card p-4">
              <Icon className="mb-1 h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-foreground">
                {value}{suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>}
              </span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Weekly Chart */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">This Week</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Calm Score Trend */}
        {calmTrendData.length >= 2 && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Calm Score Trend</h2>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={calmTrendData}>
                <XAxis dataKey="session" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 30-day heatmap */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Last 30 Days</h2>
          <div className="flex flex-wrap gap-1.5">
            {heatmapData.map(({ date, count }) => (
              <div
                key={date}
                title={`${date}: ${count} sessions`}
                className="h-5 w-5 rounded-sm transition-colors"
                style={{
                  background: count === 0
                    ? "hsl(var(--muted))"
                    : count <= 1
                      ? "hsl(var(--primary) / 0.4)"
                      : count <= 3
                        ? "hsl(var(--primary) / 0.7)"
                        : "hsl(var(--primary))",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
