import { describe, it, expect } from "vitest";
import { calculateCalmScore, PhaseTimestamp } from "./coherence";

describe("calculateCalmScore", () => {
  it("should return score 0 and building focus label when timestamps are empty", () => {
    const result = calculateCalmScore([]);
    expect(result.score).toBe(0);
    expect(result.labelKey).toBe("calm.buildingFocus");
    expect(result.color).toBe("muted-foreground");
  });

  it("should return score 100 and deep calm label for perfect matches", () => {
    const timestamps: PhaseTimestamp[] = [
      { phaseIndex: 0, expectedDuration: 4000, actualDuration: 4000 },
      { phaseIndex: 1, expectedDuration: 4000, actualDuration: 4000 }
    ];
    const result = calculateCalmScore(timestamps);
    expect(result.score).toBe(100);
    expect(result.labelKey).toBe("calm.deepCalm");
    expect(result.color).toBe("primary");
  });

  it("should handle expectedDuration of zero as 100 score contribution", () => {
    const timestamps: PhaseTimestamp[] = [
      { phaseIndex: 0, expectedDuration: 0, actualDuration: 1000 }
    ];
    const result = calculateCalmScore(timestamps);
    expect(result.score).toBe(100);
  });

  it("should calculate 50% score for 50% deviation", () => {
    const timestamps: PhaseTimestamp[] = [
      { phaseIndex: 0, expectedDuration: 4000, actualDuration: 6000 } // (6000-4000)/4000 = 0.5 deviation
    ];
    const result = calculateCalmScore(timestamps);
    expect(result.score).toBe(50);
    expect(result.labelKey).toBe("calm.goodRhythm");
    expect(result.color).toBe("accent");
  });

  it("should not let phase score go below 0", () => {
    const timestamps: PhaseTimestamp[] = [
      { phaseIndex: 0, expectedDuration: 4000, actualDuration: 10000 } // (10000-4000)/4000 = 1.5 deviation
    ];
    const result = calculateCalmScore(timestamps);
    expect(result.score).toBe(0);
  });

  it("should calculate average score correctly across multiple phases", () => {
    const timestamps: PhaseTimestamp[] = [
      { phaseIndex: 0, expectedDuration: 4000, actualDuration: 4000 }, // 100
      { phaseIndex: 1, expectedDuration: 4000, actualDuration: 6000 }  // 50
    ];
    const result = calculateCalmScore(timestamps);
    expect(result.score).toBe(75); // (100 + 50) / 2
    expect(result.labelKey).toBe("calm.strongCoherence");
  });

  describe("label thresholds", () => {
    it("should return deep calm for score >= 90", () => {
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 105 }]).score).toBe(95);
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 105 }]).labelKey).toBe("calm.deepCalm");

      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 110 }]).score).toBe(90);
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 110 }]).labelKey).toBe("calm.deepCalm");
    });

    it("should return strong coherence for score >= 70 and < 90", () => {
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 115 }]).score).toBe(85);
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 115 }]).labelKey).toBe("calm.strongCoherence");

      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 130 }]).score).toBe(70);
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 130 }]).labelKey).toBe("calm.strongCoherence");
    });

    it("should return good rhythm for score >= 40 and < 70", () => {
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 140 }]).score).toBe(60);
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 140 }]).labelKey).toBe("calm.goodRhythm");

      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 160 }]).score).toBe(40);
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 160 }]).labelKey).toBe("calm.goodRhythm");
    });

    it("should return building focus for score < 40", () => {
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 161 }]).score).toBe(39);
      expect(calculateCalmScore([{ phaseIndex: 0, expectedDuration: 100, actualDuration: 161 }]).labelKey).toBe("calm.buildingFocus");
    });
  });
});
