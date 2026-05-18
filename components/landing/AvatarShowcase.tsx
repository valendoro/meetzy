"use client";

import { useState, useRef, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";

// Mini canvas avatars
function MiniDog({ color, speaking }: { color: string; speaking: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    let rafId = 0;
    function draw() {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const f = frame.current++;
      ctx.clearRect(0, 0, 80, 80);
      const blink = Math.max(0.01, f % 200 < 6 ? 1 - (f % 200) / 3 : 1);
      const mouth = speaking ? 0.3 + Math.sin(f * 0.3) * 0.4 : 0;

      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(40, 55, 22, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8B5E3C"; ctx.beginPath(); ctx.ellipse(26, 28, 9, 14, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(54, 28, 9, 14, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c4895f"; ctx.beginPath(); ctx.ellipse(40, 30, 22, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e0b080"; ctx.beginPath(); ctx.ellipse(40, 36, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.ellipse(40, 33, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.ellipse(30, 26, 7, 7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(50, 26, 7, 7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2c1a0a";
      ctx.beginPath(); ctx.ellipse(30, 26, 4, 4 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(50, 26, 4, 4 * blink, 0, 0, Math.PI * 2); ctx.fill();
      if (mouth > 0.05) {
        ctx.fillStyle = "#c05000"; ctx.beginPath(); ctx.ellipse(40, 40 + mouth * 3, 7, 3 + mouth * 5, 0, 0, Math.PI * 2); ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [color, speaking]);

  return <canvas ref={ref} width={80} height={80} style={{ width: 80, height: 80 }} />;
}

function MiniOrange({ speaking }: { speaking: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    let rafId = 0;
    function draw() {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const f = frame.current++;
      ctx.clearRect(0, 0, 80, 80);
      const bounce = speaking ? Math.abs(Math.sin(f * 0.25)) * 5 : 0;
      const blink = Math.max(0.01, f % 220 < 6 ? 1 - (f % 220) / 3 : 1);

      ctx.save(); ctx.translate(0, -bounce);
      const g = ctx.createRadialGradient(30, 25, 5, 40, 42, 30);
      g.addColorStop(0, "#ffa030"); g.addColorStop(1, "#e05800");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(40, 45, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2ea032"; ctx.beginPath(); ctx.ellipse(46, 18, 5, 12, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4a2c0a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, 20); ctx.quadraticCurveTo(44, 12, 42, 8); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(30, 40, 7, 7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(50, 40, 7, 7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.ellipse(30, 40, 4, 4 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(50, 40, 4, 4 * blink, 0, 0, Math.PI * 2); ctx.fill();
      const m = speaking ? 0.3 + Math.sin(f * 0.3) * 0.4 : 0;
      if (m > 0.05) { ctx.fillStyle = "#c05000"; ctx.beginPath(); ctx.ellipse(40, 54, 7, 3 + m * 5, 0, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.strokeStyle = "#c05000"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(40, 52, 8, 0.2, Math.PI - 0.2); ctx.stroke(); }
      ctx.restore();
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [speaking]);

  return <canvas ref={ref} width={80} height={80} style={{ width: 80, height: 80 }} />;
}

function MiniCup({ color, speaking }: { color: string; speaking: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    let rafId = 0;
    function draw() {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const f = frame.current++;
      ctx.clearRect(0, 0, 80, 80);
      const blink = Math.max(0.01, f % 180 < 6 ? 1 - (f % 180) / 3 : 1);

      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(14, 20); ctx.lineTo(16, 68); ctx.quadraticCurveTo(40, 75, 64, 68); ctx.lineTo(66, 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(40, 20, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(62, 44, 14, -0.7, 0.7); ctx.stroke();

      const so = (f * 1.5) % 20;
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2;
      [-8, 0, 8].forEach(ox => {
        ctx.beginPath(); ctx.moveTo(40 + ox, 14 - so); ctx.quadraticCurveTo(40 + ox + 5, 7 - so, 40 + ox, 2 - so); ctx.stroke();
      });

      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.ellipse(30, 42, 7, 7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(50, 42, 7, 7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.ellipse(30, 42, 4, 4 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(50, 42, 4, 4 * blink, 0, 0, Math.PI * 2); ctx.fill();

      const m = speaking ? 0.3 + Math.sin(f * 0.3) * 0.3 : 0;
      if (m > 0.05) { ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.ellipse(40, 56, 7, 3 + m * 4, 0, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(40, 54, 8, 0.2, Math.PI - 0.2); ctx.stroke(); }

      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [color, speaking]);

  return <canvas ref={ref} width={80} height={80} style={{ width: 80, height: 80 }} />;
}

function MiniHuman({ color, speaking }: { color: string; speaking: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    let rafId = 0;
    function draw() {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const f = frame.current++;
      ctx.clearRect(0, 0, 80, 80);
      const breathe = 1 + Math.sin(f * 0.02) * 0.008;
      const blink = Math.max(0.01, f % 200 < 6 ? 1 - (f % 200) / 3 : 1);

      ctx.save(); ctx.translate(40, 55); ctx.scale(breathe, breathe); ctx.translate(-40, -55);
      ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(18, 42, 44, 30, 6); ctx.fill();
      ctx.fillStyle = "#d4956a"; ctx.beginPath(); ctx.roundRect(30, 34, 20, 12, 4); ctx.fill();
      ctx.fillStyle = "#1a1008"; ctx.beginPath(); ctx.ellipse(40, 22, 20, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d4956a"; ctx.beginPath(); ctx.ellipse(40, 24, 18, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.ellipse(34, 22, 6, 6 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(46, 22, 6, 6 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2c1a0a";
      ctx.beginPath(); ctx.ellipse(34, 22, 3.5, 3.5 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(46, 22, 3.5, 3.5 * blink, 0, 0, Math.PI * 2); ctx.fill();
      const m = speaking ? 0.4 + Math.sin(f * 0.3) * 0.4 : 0;
      if (m > 0.05) { ctx.fillStyle = "#8a3020"; ctx.beginPath(); ctx.ellipse(40, 32, 7, 3 + m * 4, 0, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.strokeStyle = "#8a4030"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(34, 32); ctx.quadraticCurveTo(40, 37, 46, 32); ctx.stroke(); }
      ctx.restore();
      rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [color, speaking]);
  return <canvas ref={ref} width={80} height={80} style={{ width: 80, height: 80 }} />;
}

const AVATARS = [
  {
    label: "Marca de ropa",
    sublabel: "Humano con chomba de tu marca",
    color: "#e11d48",
    render: (speaking: boolean) => <MiniHuman color="#e11d48" speaking={speaking} />,
  },
  {
    label: "Frutería / almacén",
    sublabel: "Naranja expresiva con cara",
    color: "#f97316",
    render: (speaking: boolean) => <MiniOrange speaking={speaking} />,
  },
  {
    label: "Veterinaria",
    sublabel: "Perro con pañuelo de tu marca",
    color: "#2563eb",
    render: (speaking: boolean) => <MiniDog color="#2563eb" speaking={speaking} />,
  },
  {
    label: "Cafetería",
    sublabel: "Taza con vapor animado",
    color: "#8B4513",
    render: (speaking: boolean) => <MiniCup color="#8B4513" speaking={speaking} />,
  },
];

export default function AvatarShowcase() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section data-section="avatar" className="section-y relative">
      <div className="section-divider-top" />

      <div className="wrap">
        <ScrollReveal className="text-center mb-14">
          <p className="kicker kicker-accent">El avatar</p>
          <h2 className="display display-lg mb-4">
            Tu agente tiene<br />tu identidad. No la nuestra.
          </h2>
          <p className="text-muted font-light text-lg max-w-lg mx-auto leading-relaxed hidden sm:block">
            Hover para verlos reaccionar. Clic para verlos hablar.
          </p>
          <p className="text-muted font-light text-lg max-w-lg mx-auto leading-relaxed sm:hidden">
            Tocá un agente para verlo hablar.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {AVATARS.map((av, i) => (
            <ScrollReveal key={i} className={`reveal-d${i + 1}`}>
              <div
                className="card p-6 flex flex-col items-center text-center cursor-pointer group"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-110"
                  style={{ background: `${av.color}10`, border: `1px solid ${av.color}25` }}
                >
                  {av.render(active === i)}
                </div>
                <p className="text-sm font-syne font-bold text-text mb-1">{av.label}</p>
                <p className="text-xs text-muted">{av.sublabel}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <p className="text-center text-sm text-muted mt-10 max-w-2xl mx-auto opacity-80">
          Plan Pro: elegís el tipo y aplicamos tu marca.
          Plan Elite: el personaje habla con voz real y lip sync.
        </p>
      </div>
    </section>
  );
}
