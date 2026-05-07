"use client";

import { useEffect, useRef } from "react";

export default function ConfettiCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = 420);
    const pieces = Array.from({ length: 42 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 120,
      w: 4 + Math.random() * 4,
      h: 6 + Math.random() * 8,
      vy: 1.5 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      hue: 230 + Math.random() * 80,
    }));

    let start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      const fade = elapsed > 1700 ? Math.max(0, 1 - (elapsed - 1700) / 800) : 1;
      ctx.globalAlpha = fade * 0.65;
      for (const p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${fade})`;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.y += p.vy;
        p.rot += p.vr;
        p.x += Math.sin(p.rot) * 0.5;
      }
      if (elapsed < 2400) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;
  return <canvas ref={ref} className="pointer-events-none fixed inset-x-0 top-0 z-[300] h-[420px]" />;
}
