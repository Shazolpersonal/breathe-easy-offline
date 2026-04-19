import { useEffect, useRef, memo } from "react";

interface ParticleBackgroundProps {
  phase: "inhale" | "hold" | "exhale" | "hold-after-exhale" | "idle";
  phaseDuration: number;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
  angle: number;
  opacity: number;
  color: number; // 0 = primary, 1 = secondary
}

function getComputedHSL(varName: string): string {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? `hsl(${val})` : "hsl(195 85% 55%)";
}

const ParticleBackground = memo(function ParticleBackground({ phase }: ParticleBackgroundProps) {
  // Track theme changes to re-read colors
  const themeAttr = typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : null;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;
    const cx = () => w() / 2;
    const cy = () => h() / 2;

    // Initialize particles
    const COUNT = 55;
    particlesRef.current = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      const x = cx() + Math.cos(angle) * dist;
      const y = cy() + Math.sin(angle) * dist;
      return {
        x, y, baseX: x, baseY: y,
        size: 1.5 + Math.random() * 2.5,
        speed: 0.2 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? 1 : 0,
      };
    });

    const colors = [
      getComputedHSL("--breathe-glow"),
      getComputedHSL("--breathe-glow-secondary"),
    ];

    const draw = () => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);
      const centerX = cx();
      const centerY = cy();
      const p = phaseRef.current;

      particlesRef.current.forEach((pt) => {
        const dx = centerX - pt.x;
        const dy = centerY - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (p === "inhale") {
          // Drift inward
          if (dist > 30) {
            pt.x += dx * 0.008;
            pt.y += dy * 0.008;
          }
        } else if (p === "exhale") {
          // Scatter outward
          if (dist < 180) {
            pt.x -= dx * 0.006;
            pt.y -= dy * 0.006;
          }
        } else {
          // Hold / idle — gentle orbit
          pt.angle += pt.speed * 0.01;
          pt.x += Math.cos(pt.angle) * 0.3;
          pt.y += Math.sin(pt.angle) * 0.3;
        }

        // Soft boundary
        if (pt.x < 10) pt.x = 10;
        if (pt.x > cw - 10) pt.x = cw - 10;
        if (pt.y < 10) pt.y = 10;
        if (pt.y > ch - 10) pt.y = ch - 10;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = colors[pt.color];
        ctx.globalAlpha = pt.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [themeAttr]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
});

export default ParticleBackground;
