import { cn } from "@/lib/utils";

interface BreathingCircleProps {
  phase: "inhale" | "hold" | "exhale" | "hold-after-exhale" | "idle";
  phaseDuration: number;
  label: string;
  secondsLeft: number;
}

export default function BreathingCircle({ phase, phaseDuration, label, secondsLeft }: BreathingCircleProps) {
  const animationClass =
    phase === "inhale"
      ? "breathe-inhale"
      : phase === "exhale"
        ? "breathe-exhale"
        : phase === "hold"
          ? "breathe-hold"
          : phase === "hold-after-exhale"
            ? "breathe-hold-small"
            : "";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      {/* Outer glow ring */}
      {phase !== "idle" && (
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-2xl"
          style={{
            background: `radial-gradient(circle, hsl(var(--breathe-glow)) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Main breathing orb */}
      <div
        className={cn(
          "relative flex h-48 w-48 items-center justify-center rounded-full transition-shadow",
          animationClass,
          phase === "idle" && "scale-[0.6] opacity-70"
        )}
        style={{
          "--phase-duration": `${phaseDuration}s`,
          background: `radial-gradient(circle at 35% 35%, hsl(var(--breathe-glow) / 0.9), hsl(var(--breathe-glow-secondary) / 0.6))`,
          boxShadow: phase !== "idle"
            ? `0 0 40px 10px hsl(var(--breathe-glow) / 0.3), 0 0 80px 20px hsl(var(--breathe-glow) / 0.15)`
            : `0 0 20px 5px hsl(var(--breathe-glow) / 0.15)`,
        } as React.CSSProperties}
      >
        <div className="flex flex-col items-center gap-1 text-center" aria-live="polite" aria-atomic="true">
          <span className="text-lg font-semibold text-primary-foreground drop-shadow-md">
            {label}
          </span>
          {phase !== "idle" && (
            <span className="text-3xl font-bold tabular-nums text-primary-foreground drop-shadow-md" aria-live="assertive">
              {secondsLeft}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
