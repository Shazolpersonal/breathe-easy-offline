import { useState, useEffect, useRef } from "react";
import { BreathingTechnique } from "@/lib/techniques";
import { cn } from "@/lib/utils";

interface BreathingPreviewProps {
  technique: BreathingTechnique;
  active: boolean;
}

export default function BreathingPreview({ technique, active }: BreathingPreviewProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const phases = technique.phases;
  // Run at 2x speed
  const speedMultiplier = 0.5;

  useEffect(() => {
    if (!active) {
      setPhaseIndex(0);
      setProgress(0);
      return;
    }

    const tickMs = 50;
    let elapsed = 0;
    const phaseDuration = phases[0].duration * speedMultiplier * 1000;
    let currentPhase = 0;
    let currentPhaseDuration = phaseDuration;

    intervalRef.current = setInterval(() => {
      elapsed += tickMs;
      const p = Math.min(elapsed / currentPhaseDuration, 1);
      setProgress(p);

      if (elapsed >= currentPhaseDuration) {
        currentPhase = (currentPhase + 1) % phases.length;
        currentPhaseDuration = phases[currentPhase].duration * speedMultiplier * 1000;
        elapsed = 0;
        setPhaseIndex(currentPhase);
      }
    }, tickMs);

    return () => clearInterval(intervalRef.current);
  }, [active, phases]);

  if (!active) return null;

  const phase = phases[phaseIndex];
  const isInhale = phase.type === "inhale";
  const isExhale = phase.type === "exhale";
  const scale = isInhale ? 0.6 + progress * 0.4 : isExhale ? 1 - progress * 0.4 : (phaseIndex > 0 && phases[phaseIndex - 1].type === "inhale") ? 1 : 0.6;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "h-4 w-4 rounded-full transition-colors duration-300",
          phase.type === "inhale" ? "bg-primary" : phase.type === "exhale" ? "bg-primary/50" : "bg-primary/30"
        )}
        style={{ transform: `scale(${scale})`, transition: "transform 0.05s linear" }}
      />
      <span className="text-[10px] text-muted-foreground capitalize">{phase.type.replace("-", " ")}</span>
    </div>
  );
}
