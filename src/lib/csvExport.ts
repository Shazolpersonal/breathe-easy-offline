import { getSessions } from "./storage";
import { PRESET_TECHNIQUES } from "./techniques";
import { getCustomTechniques } from "./storage";

const FORMULA_CHARS = ['=', '+', '-', '@', '\t', '\r'];

function escapeCSV(value: string): string {
  // Security: Prepend a single quote to prevent spreadsheet/CSV injection (DDE)
  // while preserving the original user data
  let sanitized = value;
  if (sanitized.length > 0 && FORMULA_CHARS.includes(sanitized[0])) {
    sanitized = "'" + sanitized;
  }
  if (sanitized.includes(",") || sanitized.includes('"') || sanitized.includes("\n")) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
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
      d.toISOString().substring(0, 10),
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
  const today = new Date().toISOString().substring(0, 10);
  a.href = url;
  a.download = `muhurto-sessions-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
