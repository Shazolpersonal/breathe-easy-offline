import { useEffect, useRef, useState } from "react";

interface Props {
  phase: "inhale" | "hold" | "exhale" | "hold-after-exhale" | "idle";
  phaseDuration: number;
  label: string;
  secondsLeft: number;
}

export default function MandalaVisualization({ phase, phaseDuration, label, secondsLeft }: Props) {
  const [rotation, setRotation] = useState(0);
  const animRef = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const scale =
    phase === "inhale" ? 1
    : phase === "exhale" ? 0.65
    : phase === "idle" ? 0.65
    : phase === "hold" ? 1
    : 0.65;

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speed = phaseRef.current === "inhale" ? 15 : phaseRef.current === "exhale" ? -10 : 5;
      setRotation((r) => r + speed * dt);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const petals = 12;
  const petalElements = Array.from({ length: petals }, (_, i) => {
    const angle = (360 / petals) * i;
    return (
      <ellipse
        key={i}
        cx="130" cy="130"
        rx="18" ry="55"
        fill="none"
        stroke="hsl(var(--breathe-glow))"
        strokeWidth="1.5"
        opacity={0.5 + (i % 2) * 0.2}
        transform={`rotate(${angle} 130 130)`}
      />
    );
  });

  const innerPetals = Array.from({ length: petals }, (_, i) => {
    const angle = (360 / petals) * i + 15;
    return (
      <ellipse
        key={i}
        cx="130" cy="130"
        rx="10" ry="35"
        fill="none"
        stroke="hsl(var(--breathe-glow-secondary))"
        strokeWidth="1.2"
        opacity={0.4}
        transform={`rotate(${angle} 130 130)`}
      />
    );
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      <svg
        width="260" height="260" viewBox="0 0 260 260"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: `transform ${phaseDuration}s ease-in-out`,
        }}
      >
        {petalElements}
        {innerPetals}
        <circle cx="130" cy="130" r="8" fill="hsl(var(--breathe-glow))" opacity="0.6" />
      </svg>
      <div className="absolute flex flex-col items-center gap-1 text-center">
        <span className="text-lg font-semibold text-foreground drop-shadow-md">{label}</span>
        {phase !== "idle" && (
          <span className="text-3xl font-bold tabular-nums text-foreground drop-shadow-md">{secondsLeft}</span>
        )}
      </div>
    </div>
  );
}
