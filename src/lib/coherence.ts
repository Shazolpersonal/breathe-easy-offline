export interface PhaseTimestamp {
  phaseIndex: number;
  expectedDuration: number;
  actualDuration: number;
}

export interface CalmScoreResult {
  score: number; // 0-100
  label: string;
  color: string; // hsl css variable name
}

function getLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Deep Calm", color: "primary" };
  if (score >= 70) return { label: "Strong Coherence", color: "primary" };
  if (score >= 40) return { label: "Good Rhythm", color: "accent" };
  return { label: "Building Focus", color: "muted-foreground" };
}

export function calculateCalmScore(timestamps: PhaseTimestamp[]): CalmScoreResult {
  if (timestamps.length === 0) return { score: 0, ...getLabel(0) };

  let totalScore = 0;
  for (const t of timestamps) {
    if (t.expectedDuration === 0) {
      totalScore += 100;
      continue;
    }
    const deviation = Math.abs(t.actualDuration - t.expectedDuration) / t.expectedDuration;
    const phaseScore = Math.max(0, 100 - deviation * 100);
    totalScore += phaseScore;
  }

  const score = Math.round(totalScore / timestamps.length);
  return { score, ...getLabel(score) };
}
