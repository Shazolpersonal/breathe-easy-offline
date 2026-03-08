import { getSessions } from "./storage";
import { PRESET_TECHNIQUES } from "./techniques";
import { getCustomTechniques } from "./storage";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportSessionsCSV(): void {
  const sessions = getSessions();
  const allTechniques = [...PRESET_TECHNIQUES, ...getCustomTechniques()];

  const headers = [
    "Date",
    "Time",
    "Technique",
    "Duration (min)",
    "Cycles",
    "Mood Before",
    "Mood After",
    "Calm Score",
    "Breath Accuracy",
    "Heart Rate",
    "Coherence",
  ];

  const rows = sessions.map((s) => {
    const d = new Date(s.date);
    const technique = allTechniques.find((t) => t.id === s.techniqueId);
    return [
      d.toISOString().split("T")[0],
      d.toTimeString().split(" ")[0],
      escapeCSV(technique?.name || s.techniqueName || s.techniqueId),
      (s.durationSeconds / 60).toFixed(1),
      String(s.completedCycles),
      s.moodBefore != null ? String(s.moodBefore) : "",
      s.moodAfter != null ? String(s.moodAfter) : "",
      s.calmScore != null ? String(s.calmScore) : "",
      s.breathAccuracy != null ? String(s.breathAccuracy) : "",
      s.avgHeartRate != null ? String(s.avgHeartRate) : "",
      s.heartCoherence != null ? String(s.heartCoherence) : "",
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `muhurto-sessions-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
