"use client";

import { useEffect, useRef } from "react";

/** Simple canvas Mascot (~64px) — eyes + mouth react to `talking`. */
export default function MiloCanvas({ talking = false, className = "" }: { talking?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const size = 64;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const draw = () => {
      tRef.current += 0.08;
      const t = tRef.current;
      ctx.clearRect(0, 0, size, size);

      const blink = Math.sin(t * 0.7) > 0.92 ? 0.15 : 1;
      const mouthOpen = talking ? 0.35 + Math.sin(t * 14) * 0.12 : 0.08 + Math.sin(t * 2) * 0.02;

      ctx.fillStyle = "#6366f1";
      ctx.beginPath();
      ctx.moveTo(18, 4);
      ctx.lineTo(46, 4);
      ctx.quadraticCurveTo(58, 4, 58, 16);
      ctx.lineTo(58, 48);
      ctx.quadraticCurveTo(58, 60, 46, 60);
      ctx.lineTo(18, 60);
      ctx.quadraticCurveTo(6, 60, 6, 48);
      ctx.lineTo(6, 16);
      ctx.quadraticCurveTo(6, 4, 18, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      const eyeY = 24;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.ellipse(22, eyeY, 6, 6 * blink, 0, 0, Math.PI * 2);
      ctx.ellipse(42, eyeY, 6, 6 * blink, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.ellipse(22, eyeY, 2.2, 2.2 * blink, 0, 0, Math.PI * 2);
      ctx.ellipse(42, eyeY, 2.2, 2.2 * blink, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#1e1b4b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 36, 8, 0.15 * Math.PI, (1 - mouthOpen) * Math.PI + 0.15 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(16, 48);
      ctx.lineTo(48, 48);
      ctx.quadraticCurveTo(52, 48, 52, 52);
      ctx.lineTo(52, 52);
      ctx.quadraticCurveTo(52, 56, 48, 56);
      ctx.lineTo(16, 56);
      ctx.quadraticCurveTo(12, 56, 12, 52);
      ctx.lineTo(12, 52);
      ctx.quadraticCurveTo(12, 48, 16, 48);
      ctx.closePath();
      ctx.fill();

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [talking]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
