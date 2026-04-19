import { memo } from "react";

interface ScreenColorBreathingProps {
  phase: "inhale" | "hold" | "exhale" | "hold-after-exhale" | "idle";
  phaseDuration: number;
}

const ScreenColorBreathing = memo(function ScreenColorBreathing({ phase, phaseDuration }: ScreenColorBreathingProps) {
  const bg =
    phase === "inhale"
      ? "radial-gradient(ellipse at center, hsla(30, 80%, 55%, 0.1) 0%, transparent 70%)"
      : phase === "exhale"
        ? "radial-gradient(ellipse at center, hsla(195, 80%, 50%, 0.1) 0%, transparent 70%)"
        : phase === "hold"
          ? "radial-gradient(ellipse at center, hsla(30, 80%, 55%, 0.06) 0%, transparent 70%)"
          : phase === "hold-after-exhale"
            ? "radial-gradient(ellipse at center, hsla(195, 80%, 50%, 0.06) 0%, transparent 70%)"
            : "transparent";

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background: bg,
        transition: `background ${phaseDuration}s ease-in-out`,
        zIndex: 0,
      }}
    />
  );
});

export default ScreenColorBreathing;
