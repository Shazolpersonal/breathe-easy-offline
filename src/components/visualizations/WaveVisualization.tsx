import { useEffect, useRef } from "react";

interface Props {
  phase: "inhale" | "hold" | "exhale" | "hold-after-exhale" | "idle";
  phaseDuration: number;
  label: string;
  secondsLeft: number;
}

function getHSL(varName: string): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? `hsl(${val})` : "hsl(195 85% 55%)";
}

export default function WaveVisualization({ phase, phaseDuration, label, secondsLeft }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const ampRef = useRef(20);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 260;
    canvas.width = SIZE * devicePixelRatio;
    canvas.height = SIZE * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    let t = 0;
    const targetAmp = () => {
      const p = phaseRef.current;
      if (p === "inhale") return 50;
      if (p === "exhale") return 10;
      if (p === "idle") return 15;
      return ampRef.current; // hold — stay
    };

    const color1 = getHSL("--breathe-glow");
    const color2 = getHSL("--breathe-glow-secondary");

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ampRef.current += (targetAmp() - ampRef.current) * 0.03;
      t += 0.03;

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        ctx.strokeStyle = wave === 0 ? color1 : color2;
        ctx.globalAlpha = 0.6 - wave * 0.15;
        ctx.lineWidth = 2.5 - wave * 0.5;

        for (let x = 0; x <= SIZE; x += 2) {
          const y = SIZE / 2 + Math.sin((x / SIZE) * Math.PI * 3 + t + wave * 0.8) * ampRef.current;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      <canvas ref={canvasRef} style={{ width: 260, height: 260 }} />
      <div className="absolute flex flex-col items-center gap-1 text-center">
        <span className="text-lg font-semibold text-foreground drop-shadow-md">{label}</span>
        {phase !== "idle" && (
          <span className="text-3xl font-bold tabular-nums text-foreground drop-shadow-md">{secondsLeft}</span>
        )}
      </div>
    </div>
  );
}
