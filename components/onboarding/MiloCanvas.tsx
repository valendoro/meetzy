"use client";

import { useEffect, useRef } from "react";

type MiloMode = "idle" | "speak";

/**
 * Meetzy mascot on canvas (~64px) — gradient body, blink, mouth for speak/idle.
 */
export default function MiloCanvas({
  mode = "idle",
  className = "",
  brandTint = "#6366f1",
}: {
  mode?: MiloMode;
  className?: string;
  /** Subtle rim light tied to user's brand in onboarding */
  brandTint?: string;
}) {
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
      tRef.current += 0.085;
      const t = tRef.current;
      ctx.clearRect(0, 0, size, size);

      const speaking = mode === "speak";
      const blink = Math.sin(t * 0.65) > 0.93 ? 0.12 : 1;
      const mouthOpen = speaking ? 0.38 + Math.sin(t * 15) * 0.14 : 0.08 + Math.sin(t * 2.2) * 0.03;
      const bounce = speaking ? Math.sin(t * 11) * 0.4 : 0;

      const g = ctx.createLinearGradient(8, 4, 56, 60);
      g.addColorStop(0, brandTint);
      g.addColorStop(0.45, "#4f46e5");
      g.addColorStop(1, "#312e81");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(18 + bounce * 0.3, 4);
      ctx.lineTo(46 + bounce * 0.3, 4);
      ctx.quadraticCurveTo(58 + bounce * 0.2, 4, 58, 16);
      ctx.lineTo(58, 48);
      ctx.quadraticCurveTo(58, 60, 46, 60);
      ctx.lineTo(18, 60);
      ctx.quadraticCurveTo(6, 60, 6, 48);
      ctx.lineTo(6, 16);
      ctx.quadraticCurveTo(6, 4, 18 + bounce * 0.3, 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      ctx.fillStyle = "rgba(255,182,193,0.35)";
      ctx.beginPath();
      ctx.ellipse(20, 38 + bounce * 0.2, 5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(44, 38 + bounce * 0.2, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.beginPath();
      ctx.ellipse(24, 26 + bounce * 0.15, 7, 6.5 * blink, 0, 0, Math.PI * 2);
      ctx.ellipse(40, 26 + bounce * 0.15, 7, 6.5 * blink, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(24, 26.5 + bounce * 0.15, 2.5, 2.6 * blink, 0, 0, Math.PI * 2);
      ctx.ellipse(40, 26.5 + bounce * 0.15, 2.5, 2.6 * blink, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(25.5, 25 + bounce * 0.15, 1.1, 0, Math.PI * 2);
      ctx.arc(41.2, 25.2 + bounce * 0.15, 1, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 36 + bounce * 0.2, 7, 0.18 * Math.PI + mouthOpen * 0.08, (1 - mouthOpen) * Math.PI + 0.18 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(48, 10);
      ctx.quadraticCurveTo(56, 2, 58, 2);
      ctx.stroke();
      ctx.fillStyle = speaking ? "#fde68a" : "rgba(253,230,138,0.85)";
      ctx.beginPath();
      ctx.arc(58.5, 2, 2.4, 0, Math.PI * 2);
      ctx.fill();

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [mode, brandTint]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
