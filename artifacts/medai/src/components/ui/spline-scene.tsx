import { useEffect, useRef } from "react";

interface SplineSceneProps {
  scene?: string;
  className?: string;
}

export function SplineScene({ className }: SplineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Floating orb rings
      for (let i = 0; i < 3; i++) {
        const phase = t * 0.6 + i * ((Math.PI * 2) / 3);
        const ox = cx + Math.cos(phase) * (28 + i * 14);
        const oy = cy + Math.sin(phase * 0.7) * (16 + i * 8);
        const r = 6 - i * 1.2;
        const alpha = 0.25 + 0.18 * Math.sin(t * 1.2 + i);
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(217,91%,65%,${alpha})`;
        ctx.fill();
      }

      // Pulsing heart / cross
      const pulse = 1 + 0.08 * Math.sin(t * 2.2);
      const s = Math.min(w, h) * 0.18 * pulse;

      ctx.save();
      ctx.translate(cx, cy);

      // Outer glow circle
      const grd = ctx.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 1.4);
      grd.addColorStop(0, "hsla(217,91%,65%,0.18)");
      grd.addColorStop(1, "hsla(217,91%,65%,0)");
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Inner circle
      const inner = ctx.createRadialGradient(0, -s * 0.1, s * 0.1, 0, 0, s * 0.9);
      inner.addColorStop(0, "hsla(217,91%,72%,0.95)");
      inner.addColorStop(1, "hsla(217,60%,45%,0.85)");
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = inner;
      ctx.shadowColor = "hsla(217,91%,65%,0.6)";
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cross / stethoscope icon
      const arm = s * 0.38;
      const thick = s * 0.13;
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath();
      ctx.roundRect(-thick / 2, -arm, thick, arm * 2, thick * 0.4);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(-arm, -thick / 2, arm * 2, thick, thick * 0.4);
      ctx.fill();

      ctx.restore();

      // Rotating orbit ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.4);
      ctx.strokeStyle = "hsla(152,68%,45%,0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.6, s * 1.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Second orbit (counter)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.25);
      ctx.strokeStyle = "hsla(217,91%,65%,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 14]);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 2.1, s * 1.5, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Particle dots on orbit
      for (let i = 0; i < 6; i++) {
        const angle = t * 0.4 + (i * Math.PI * 2) / 6;
        const px = cx + Math.cos(angle) * s * 1.6;
        const py = cy + Math.sin(angle) * s * 1.1;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(152,68%,50%,${0.5 + 0.3 * Math.sin(t * 2 + i)})`;
        ctx.fill();
      }

      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
