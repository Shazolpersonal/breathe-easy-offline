export interface PyramidConfig {
  startMultiplier: number;  // e.g. 1.0
  peakMultiplier: number;   // e.g. 1.5
  steps: number;            // e.g. 5 (rounds up then down)
}

export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  phases: BreathingPhase[];
  rounds?: number;
  isCustom?: boolean;
  pyramid?: PyramidConfig;
}

export interface BreathingPhase {
  type: "inhale" | "hold" | "exhale" | "hold-after-exhale";
  duration: number; // seconds
  label: string;
}

export const PRESET_TECHNIQUES: BreathingTechnique[] = [
  {
    id: "box-breathing",
    name: "Box Breathing",
    description: "Equal timing for all four phases. Used by Navy SEALs to stay calm under pressure.",
    benefits: ["Reduces stress", "Improves focus", "Calms nervous system"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 4, label: "Breathe In" },
      { type: "hold", duration: 4, label: "Hold" },
      { type: "exhale", duration: 4, label: "Breathe Out" },
      { type: "hold-after-exhale", duration: 4, label: "Hold" },
    ],
  },
  {
    id: "4-7-8",
    name: "4-7-8 Relaxation",
    description: "Dr. Andrew Weil's technique. A natural tranquilizer for the nervous system.",
    benefits: ["Promotes sleep", "Reduces anxiety", "Lowers heart rate"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 4, label: "Breathe In" },
      { type: "hold", duration: 7, label: "Hold" },
      { type: "exhale", duration: 8, label: "Breathe Out" },
    ],
  },
  {
    id: "calm-breath",
    name: "Calm Breath",
    description: "Simple 4-6 breathing pattern. Longer exhale activates the parasympathetic system.",
    benefits: ["Quick calm down", "Easy to learn", "Reduces tension"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 4, label: "Breathe In" },
      { type: "exhale", duration: 6, label: "Breathe Out" },
    ],
  },
  {
    id: "equal-breathing",
    name: "Equal Breathing",
    description: "Sama Vritti — balance inhale and exhale for equilibrium and presence.",
    benefits: ["Balances mind", "Improves concentration", "Grounds energy"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 5, label: "Breathe In" },
      { type: "exhale", duration: 5, label: "Breathe Out" },
    ],
  },
  {
    id: "wim-hof",
    name: "Wim Hof Method",
    description: "Power breathing followed by a long retention. Energizing and invigorating.",
    benefits: ["Boosts energy", "Strengthens immunity", "Increases willpower"],
    difficulty: "advanced",
    rounds: 3,
    phases: [
      { type: "inhale", duration: 2, label: "Power Inhale" },
      { type: "exhale", duration: 2, label: "Let Go" },
    ],
  },
  {
    id: "physiological-sigh",
    name: "Physiological Sigh",
    description: "Stanford-researched double inhale followed by a long exhale. The fastest way to calm down in real-time.",
    benefits: ["Instant calm", "Reduces CO₂", "Science-backed"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 2, label: "Inhale 1" },
      { type: "inhale", duration: 1, label: "Inhale 2" },
      { type: "exhale", duration: 6, label: "Long Exhale" },
    ],
  },
  {
    id: "resonant-breathing",
    name: "Resonant Breathing",
    description: "5.5 breaths per minute — the ideal rate for heart rate variability and nervous system balance.",
    benefits: ["Maximizes HRV", "Deep relaxation", "Emotional balance"],
    difficulty: "intermediate",
    phases: [
      { type: "inhale", duration: 5.5, label: "Breathe In" },
      { type: "exhale", duration: 5.5, label: "Breathe Out" },
    ],
  },
  {
    id: "alternate-nostril",
    name: "Alternate Nostril (Nadi Shodhana)",
    description: "Ancient yogic technique. Balances left and right brain hemispheres for mental clarity.",
    benefits: ["Balances hemispheres", "Reduces anxiety", "Enhances focus"],
    difficulty: "intermediate",
    phases: [
      { type: "inhale", duration: 4, label: "Left Nostril In" },
      { type: "hold", duration: 4, label: "Hold" },
      { type: "exhale", duration: 4, label: "Right Nostril Out" },
      { type: "inhale", duration: 4, label: "Right Nostril In" },
      { type: "hold", duration: 4, label: "Hold" },
      { type: "exhale", duration: 4, label: "Left Nostril Out" },
    ],
  },
  {
    id: "diaphragmatic",
    name: "Diaphragmatic Breathing",
    description: "Deep belly breathing that strengthens the diaphragm. Foundation of all breathing practices.",
    benefits: ["Strengthens diaphragm", "Lowers blood pressure", "Improves core stability"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 4, label: "Belly Rise" },
      { type: "exhale", duration: 6, label: "Belly Fall" },
    ],
  },
  {
    id: "pursed-lip",
    name: "Pursed Lip Breathing",
    description: "Medical-grade technique for COPD and asthma patients. Slows breathing rate and improves ventilation.",
    benefits: ["Opens airways", "Reduces breathlessness", "Medical-grade"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 2, label: "Nose Inhale" },
      { type: "exhale", duration: 4, label: "Pursed Exhale" },
    ],
  },
  {
    id: "energizing-breath",
    name: "Energizing Breath (2-1-4-1)",
    description: "Quick inhale, short hold, longer exhale pattern. Activates the sympathetic system for alertness.",
    benefits: ["Increases alertness", "Morning energizer", "Sharpens mind"],
    difficulty: "intermediate",
    phases: [
      { type: "inhale", duration: 2, label: "Quick Inhale" },
      { type: "hold", duration: 1, label: "Hold" },
      { type: "exhale", duration: 4, label: "Controlled Exhale" },
      { type: "hold-after-exhale", duration: 1, label: "Hold" },
    ],
  },
  {
    id: "4-4-6-2",
    name: "Sleep Breath (4-4-6-2)",
    description: "Optimized for falling asleep. Extended exhale with brief pause creates a gentle lulling rhythm.",
    benefits: ["Promotes deep sleep", "Reduces racing thoughts", "Gentle rhythm"],
    difficulty: "beginner",
    phases: [
      { type: "inhale", duration: 4, label: "Breathe In" },
      { type: "hold", duration: 4, label: "Hold" },
      { type: "exhale", duration: 6, label: "Slow Exhale" },
      { type: "hold-after-exhale", duration: 2, label: "Rest" },
    ],
  },
];

export function getTechniqueById(id: string, customTechniques: BreathingTechnique[] = []): BreathingTechnique | undefined {
  return [...PRESET_TECHNIQUES, ...customTechniques].find((t) => t.id === id);
}

export function getCycleDuration(technique: BreathingTechnique): number {
  return technique.phases.reduce((sum, p) => sum + p.duration, 0);
}

/**
 * For pyramid breathing: returns scaled phases for a given round.
 * Round 0..steps-1 ramps up, then mirrors back down.
 */
export function getPyramidPhasesForRound(technique: BreathingTechnique, round: number): BreathingPhase[] {
  if (!technique.pyramid) return technique.phases;
  const { startMultiplier, peakMultiplier, steps } = technique.pyramid;
  // Create a triangle pattern: 0,1,...,steps-1,steps-2,...,0
  const totalCycleLen = steps * 2 - 1;
  const pos = round % totalCycleLen;
  const mirroredPos = pos < steps ? pos : totalCycleLen - 1 - pos;
  const t = steps > 1 ? mirroredPos / (steps - 1) : 0;
  const multiplier = startMultiplier + t * (peakMultiplier - startMultiplier);

  return technique.phases.map(p => ({
    ...p,
    duration: Math.round(p.duration * multiplier),
  }));
}
