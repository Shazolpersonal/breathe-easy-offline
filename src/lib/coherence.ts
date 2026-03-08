export interface PhaseTimestamp {
  phaseIndex: number;
  expectedDuration: number;
  actualDuration: number;
}

export interface CalmScoreResult {
  score: number; // 0-100
  labelKey: string; // locale key
  color: string; // hsl css variable name
}

function getLabel(score: number): { labelKey: string; color: string } {
  if (score >= 90) return { labelKey: "calm.deepCalm", color: "primary" };
  if (score >= 70) return { labelKey: "calm.strongCoherence", color: "primary" };
  if (score >= 40) return { labelKey: "calm.goodRhythm", color: "accent" };
  return { labelKey: "calm.buildingFocus", color: "muted-foreground" };
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
