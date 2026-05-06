"use client";

import { useRef, useEffect, useCallback } from "react";

export interface AvatarConfig {
  type: string;
  subtype: string;
  brandColor: string;
  brandColor2: string;
  logoUrl?: string;
  isTalking?: boolean;
  size?: number;
}

interface AvatarState {
  blinkTimer: number;
  blinkProgress: number;
  breathePhase: number;
  mouthOpen: number;
  headWobble: number;
  wobbleDir: number;
  frame: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : { r: 99, g: 102, b: 241 };
}

function darken(hex: string, amount = 30): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)}, ${Math.max(0, g - amount)}, ${Math.max(0, b - amount)})`;
}

function lighten(hex: string, amount = 60): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)}, ${Math.min(255, g + amount)}, ${Math.min(255, b + amount)})`;
}

type RoundRectCtx = CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void };

function drawHuman(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  state: AvatarState,
  config: AvatarConfig
) {
  const s = size / 200;
  const isFemale = config.subtype === "female";
  const skinColor = isFemale ? "#f5c5a0" : "#e8b88a";
  const hairColor = isFemale ? "#4a2c0a" : "#2c1a0a";

  ctx.save();
  ctx.translate(cx, cy + state.breathePhase * 2 * s);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(0, 85 * s, 35 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const rctx = ctx as RoundRectCtx;

  // Torso/body with brand color
  rctx.fillStyle = config.brandColor;
  ctx.beginPath();
  rctx.roundRect(-28 * s, 30 * s, 56 * s, 60 * s, 8 * s);
  ctx.fill();

  // Logo on torso
  if (config.logoUrl) {
    const img = new Image();
    img.src = config.logoUrl;
    ctx.drawImage(img, -12 * s, 38 * s, 24 * s, 24 * s);
  } else {
    // Brand initial
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `bold ${14 * s}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", 0, 58 * s);
  }

  // Arms
  rctx.fillStyle = config.brandColor;
  ctx.beginPath();
  rctx.roundRect(-44 * s, 32 * s, 18 * s, 45 * s, 6 * s);
  ctx.fill();
  ctx.beginPath();
  rctx.roundRect(26 * s, 32 * s, 18 * s, 45 * s, 6 * s);
  ctx.fill();

  // Hands
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(-35 * s, 78 * s, 9 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(35 * s, 78 * s, 9 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  rctx.roundRect(-8 * s, 10 * s, 16 * s, 22 * s, 4 * s);
  ctx.fill();

  // Head with wobble
  ctx.save();
  ctx.translate(state.headWobble * s, 0);

  // Hair (behind head)
  ctx.fillStyle = hairColor;
  if (isFemale) {
    ctx.beginPath();
    ctx.ellipse(0, -32 * s, 35 * s, 40 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Long hair
    ctx.beginPath();
    ctx.roundRect(-34 * s, -35 * s, 12 * s, 60 * s, 6 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(22 * s, -35 * s, 12 * s, 60 * s, 6 * s);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(0, -35 * s, 30 * s, 25 * s, 0, 0, Math.PI);
    ctx.fill();
  }

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(0, -20 * s, 30 * s, 35 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeY = -25 * s;
  const blinkScale = Math.max(0.01, state.blinkProgress);

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-10 * s, eyeY, 8 * s, 8 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10 * s, eyeY, 8 * s, 8 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2c1a0a";
  ctx.beginPath();
  ctx.ellipse(-10 * s, eyeY, 5 * s, 5 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10 * s, eyeY, 5 * s, 5 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils shine
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.ellipse(-8 * s, eyeY - 2 * s, 2 * s, 2 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12 * s, eyeY - 2 * s, 2 * s, 2 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = darken(skinColor, 20);
  ctx.beginPath();
  ctx.ellipse(0, -12 * s, 4 * s, 5 * s, 0, 0, Math.PI);
  ctx.fill();

  // Mouth
  const mouthOpen = state.mouthOpen;
  ctx.fillStyle = "#c0392b";
  ctx.beginPath();
  ctx.ellipse(0, -4 * s, 10 * s, (3 + mouthOpen * 5) * s, 0, 0, Math.PI);
  ctx.fill();

  if (mouthOpen > 0.1) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(0, -2 * s, 8 * s, mouthOpen * 4 * s, 0, 0, Math.PI);
    ctx.fill();
  }

  // Cheeks
  ctx.fillStyle = "rgba(255, 150, 150, 0.25)";
  ctx.beginPath();
  ctx.ellipse(-22 * s, -8 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(22 * s, -8 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawDog(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  state: AvatarState,
  config: AvatarConfig
) {
  const s = size / 200;
  ctx.save();
  ctx.translate(cx, cy + state.breathePhase * 2 * s);

  // Body with brand color shirt/vest
  ctx.fillStyle = config.brandColor;
  ctx.beginPath();
  ctx.roundRect(-30 * s, 20 * s, 60 * s, 70 * s, 10 * s);
  ctx.fill();

  // Paws
  ctx.fillStyle = "#c4895f";
  ctx.beginPath();
  ctx.ellipse(-32 * s, 75 * s, 10 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(32 * s, 75 * s, 10 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(state.headWobble * s, 0);

  // Floppy ears (behind head)
  ctx.fillStyle = "#8B5E3C";
  ctx.beginPath();
  ctx.ellipse(-28 * s, -18 * s, 14 * s, 22 * s, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(28 * s, -18 * s, 14 * s, 22 * s, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#c4895f";
  ctx.beginPath();
  ctx.ellipse(0, -15 * s, 35 * s, 32 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = "#e0b080";
  ctx.beginPath();
  ctx.ellipse(0, 0 * s, 18 * s, 14 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, -4 * s, 7 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const blinkScale = Math.max(0.01, state.blinkProgress);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-14 * s, -22 * s, 9 * s, 9 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(14 * s, -22 * s, 9 * s, 9 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2c1a0a";
  ctx.beginPath();
  ctx.ellipse(-14 * s, -22 * s, 6 * s, 6 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(14 * s, -22 * s, 6 * s, 6 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "#6b3a1f";
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(-8 * s, 6 * s);
  ctx.quadraticCurveTo(0, (10 + state.mouthOpen * 8) * s, 8 * s, 6 * s);
  ctx.stroke();

  // Tongue when talking
  if (state.mouthOpen > 0.2) {
    ctx.fillStyle = "#e05c7a";
    ctx.beginPath();
    ctx.ellipse(0, (12 + state.mouthOpen * 5) * s, 6 * s, 7 * s, 0, 0, Math.PI);
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();
}

function drawOrange(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  state: AvatarState,
  _config: AvatarConfig
) {
  const s = size / 200;
  const bounce = state.mouthOpen > 0.2 ? Math.abs(Math.sin(state.frame * 0.3)) * 6 : 0;

  ctx.save();
  ctx.translate(cx, cy - bounce * s + state.breathePhase * 2 * s);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 70 * s + bounce * s, 38 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orange body
  const grad = ctx.createRadialGradient(-15 * s, -20 * s, 5 * s, 0, 0, 55 * s);
  grad.addColorStop(0, "#ffa030");
  grad.addColorStop(1, "#e05800");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 10 * s, 55 * s, 0, Math.PI * 2);
  ctx.fill();

  // Leaf
  ctx.fillStyle = "#2ea032";
  ctx.beginPath();
  ctx.ellipse(5 * s, -46 * s, 8 * s, 18 * s, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e8020";
  ctx.beginPath();
  ctx.ellipse(-5 * s, -44 * s, 6 * s, 14 * s, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.strokeStyle = "#4a2c0a";
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(0, -42 * s);
  ctx.quadraticCurveTo(5 * s, -55 * s, 0, -62 * s);
  ctx.stroke();

  // Eyes
  const blinkScale = Math.max(0.01, state.blinkProgress);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-16 * s, -5 * s, 10 * s, 10 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16 * s, -5 * s, 10 * s, 10 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(-16 * s, -5 * s, 6 * s, 6 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16 * s, -5 * s, 6 * s, 6 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shine
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.ellipse(-14 * s, -7 * s, 3 * s, 2 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18 * s, -7 * s, 3 * s, 2 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "#c05000";
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(0, 10 * s, 16 * s, 0.2, Math.PI - 0.2);
  ctx.stroke();

  if (state.mouthOpen > 0.1) {
    ctx.fillStyle = "#c05000";
    ctx.beginPath();
    ctx.ellipse(0, 20 * s, 12 * s, (3 + state.mouthOpen * 8) * s, 0, 0, Math.PI);
    ctx.fill();
  }

  ctx.restore();
}

function drawCup(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  state: AvatarState,
  config: AvatarConfig
) {
  const s = size / 200;
  ctx.save();
  ctx.translate(cx, cy + state.breathePhase * 2 * s);

  // Handle
  ctx.strokeStyle = config.brandColor;
  ctx.lineWidth = 8 * s;
  ctx.beginPath();
  ctx.arc(42 * s, 15 * s, 18 * s, -0.8, 0.8);
  ctx.stroke();

  // Cup body with brand color
  ctx.fillStyle = config.brandColor;
  ctx.beginPath();
  ctx.moveTo(-30 * s, -30 * s);
  ctx.lineTo(-35 * s, 50 * s);
  ctx.quadraticCurveTo(0, 62 * s, 35 * s, 50 * s);
  ctx.lineTo(30 * s, -30 * s);
  ctx.closePath();
  ctx.fill();

  // Rim
  ctx.fillStyle = lighten(config.brandColor, 40);
  ctx.beginPath();
  ctx.ellipse(0, -30 * s, 30 * s, 8 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Steam (when active)
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 3 * s;
  const steamOffset = (state.frame * 2) % 20;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 10 * s, -38 * s - steamOffset * s);
    ctx.quadraticCurveTo(
      (i + 1) * 8 * s,
      -52 * s - steamOffset * s,
      i * 8 * s,
      -66 * s - steamOffset * s
    );
    ctx.stroke();
  }

  // Eyes
  const blinkScale = Math.max(0.01, state.blinkProgress);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(-10 * s, -5 * s, 9 * s, 9 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10 * s, -5 * s, 9 * s, 9 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(-10 * s, -5 * s, 5 * s, 5 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10 * s, -5 * s, 5 * s, 5 * blinkScale * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.arc(0, 15 * s, 12 * s, 0.2, Math.PI - 0.2);
  ctx.stroke();

  if (state.mouthOpen > 0.1) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 22 * s, 8 * s, (2 + state.mouthOpen * 6) * s, 0, 0, Math.PI);
    ctx.fill();
  }

  ctx.restore();
}

export default function AvatarCanvas({
  config,
  size = 120,
}: {
  config: AvatarConfig;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<AvatarState>({
    blinkTimer: 200,
    blinkProgress: 1,
    breathePhase: 0,
    mouthOpen: 0,
    headWobble: 0,
    wobbleDir: 1,
    frame: 0,
  });
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = w / 2;
    const cy = h / 2;

    // Update animations
    state.frame++;
    state.breathePhase = Math.sin(state.frame * 0.02);

    // Blink
    state.blinkTimer--;
    if (state.blinkTimer <= 0) {
      state.blinkTimer = 180 + Math.random() * 120;
    }
    if (state.blinkTimer < 10) {
      state.blinkProgress = state.blinkTimer < 5
        ? state.blinkTimer / 5
        : (10 - state.blinkTimer) / 5;
    } else {
      state.blinkProgress = 1;
    }

    // Head wobble (subtle)
    state.headWobble += state.wobbleDir * 0.04;
    if (Math.abs(state.headWobble) > 1.5) state.wobbleDir *= -1;

    // Talking mouth
    if (config.isTalking) {
      state.mouthOpen = 0.3 + Math.sin(state.frame * 0.25) * 0.4;
    } else {
      state.mouthOpen = Math.max(0, state.mouthOpen - 0.08);
    }

    switch (config.type) {
      case "human":
        drawHuman(ctx, cx, cy, size, state, config);
        break;
      case "animal":
        if (config.subtype === "perro" || config.subtype === "dog") {
          drawDog(ctx, cx, cy, size, state, config);
        } else {
          drawDog(ctx, cx, cy, size, state, config);
        }
        break;
      case "object":
        if (config.subtype === "naranja" || config.subtype === "orange") {
          drawOrange(ctx, cx, cy, size, state, config);
        } else if (config.subtype === "taza" || config.subtype === "cup") {
          drawCup(ctx, cx, cy, size, state, config);
        } else {
          drawOrange(ctx, cx, cy, size, state, config);
        }
        break;
      default:
        drawHuman(ctx, cx, cy, size, state, config);
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [config, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-full"
    />
  );
}
