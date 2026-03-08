import { useEffect, useState, useRef } from "react";

interface Props {
  phase: "inhale" | "hold" | "exhale" | "hold-after-exhale" | "idle";
  phaseDuration: number;
  label: string;
  secondsLeft: number;
}

const BAR_COUNT = 7;

export default function BarsVisualization({ phase, phaseDuration, label, secondsLeft }: Props) {
  const [heights, setHeights] = useState<number[]>(Array(BAR_COUNT).fill(20));
  const holdIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const isHold = phase === "hold" || phase === "hold-after-exhale";

  useEffect(() => {
    clearInterval(holdIntervalRef.current);

    const target =
      phase === "inhale" ? 90
      : phase === "exhale" ? 15
      : phase === "idle" ? 20
      : phase === "hold" ? 90
      : 15; // hold-after-exhale

    const newHeights = Array.from({ length: BAR_COUNT }, (_, i) => {
      const offset = Math.sin((i / BAR_COUNT) * Math.PI) * 20;
      return Math.max(10, target + offset);
    });
    setHeights(newHeights);

    // Add subtle oscillation during hold phases
    if (isHold) {
      holdIntervalRef.current = setInterval(() => {
        const t = Date.now() / 1000;
        setHeights(Array.from({ length: BAR_COUNT }, (_, i) => {
          const offset = Math.sin((i / BAR_COUNT) * Math.PI) * 20;
          const osc = Math.sin(t * 1.5 + i * 0.7) * 5;
          return Math.max(10, target + offset + osc);
        }));
      }, 400);
    }

    return () => clearInterval(holdIntervalRef.current);
  }, [phase, isHold]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      <div className="flex items-end gap-2" style={{ height: 160 }}>
        {heights.map((h, i) => (
          <div
            key={i}
            className="w-5 rounded-t-lg"
            style={{
              height: `${h}%`,
              background: `linear-gradient(to top, hsl(var(--breathe-glow)), hsl(var(--breathe-glow-secondary)))`,
              opacity: 0.7 + (i % 2) * 0.15,
              transition: `height ${isHold ? 0.4 : phaseDuration}s ease-in-out`,
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-4 flex flex-col items-center gap-1 text-center">
        <span className="text-lg font-semibold text-foreground drop-shadow-md">{label}</span>
        {phase !== "idle" && (
          <span className="text-3xl font-bold tabular-nums text-foreground drop-shadow-md">{secondsLeft}</span>
        )}
      </div>
    </div>
  );
}
