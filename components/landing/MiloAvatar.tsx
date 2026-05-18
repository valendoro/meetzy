"use client";

import { useEffect, useRef } from "react";

export interface MiloAvatarProps {
  size?: number;
  isSpeaking?: boolean;
  mousePosition?: { x: number; y: number };
  containerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

// ── Canvas constants (intrinsic resolution) ───────────────
const CW = 240;
const CH = 380;
const CX = CW / 2;

// ── Animation state ───────────────────────────────────────
interface MiloState {
  frame: number;
  breathePhase: number;
  blinkTimer: number;
  blinkProgress: number;
  isBlinking: boolean;
  headTiltTimer: number;
  headTilt: number;
  headTiltTarget: number;
  eyeOffsetX: number;
  eyeOffsetY: number;
  eyeOffsetXTarget: number;
  eyeOffsetYTarget: number;
  mouthOpenness: number;
  lastScrollEvent: number;
  browRaise: number;
}

function createMiloState(): MiloState {
  return {
    frame: 0,
    breathePhase: 0,
    blinkTimer: 120 + Math.random() * 80,
    blinkProgress: 0,
    isBlinking: false,
    headTiltTimer: 240 + Math.random() * 160,
    headTilt: 0,
    headTiltTarget: 0,
    eyeOffsetX: 0,
    eyeOffsetY: 0,
    eyeOffsetXTarget: 0,
    eyeOffsetYTarget: 0,
    mouthOpenness: 0,
    lastScrollEvent: 0,
    browRaise: 0,
  };
}

// ── Helper ────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Drawing ───────────────────────────────────────────────
function drawMilo(ctx: CanvasRenderingContext2D, state: MiloState, dpr: number) {
  ctx.clearRect(0, 0, CW * dpr, CH * dpr);
  ctx.save();
  ctx.scale(dpr, dpr);

  // Breathe
  const breatheScale = 1 + Math.sin(state.breathePhase) * 0.005;
  ctx.save();
  ctx.translate(CX, CH * 0.5);
  ctx.scale(breatheScale, breatheScale);
  ctx.translate(-CX, -CH * 0.5);

  const headCY = 90;
  const tiltRad = (state.headTilt * Math.PI) / 180;
  const skin = "#f0be8a";
  const skinDark = "#d49660";
  const skinLight = "#fdd5a8";

  // ── BODY ──────────────────────────────────────────────────
  const bodyTop = 178;
  const bodyH = 162;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(CX, bodyTop + bodyH + 8, 62, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jacket — dark with violet undertone
  const jacketGrad = ctx.createLinearGradient(CX - 74, bodyTop, CX + 74, bodyTop + bodyH);
  jacketGrad.addColorStop(0, "#1c1a2c");
  jacketGrad.addColorStop(0.45, "#131122");
  jacketGrad.addColorStop(1, "#0c0b18");
  ctx.fillStyle = jacketGrad;
  ctx.beginPath();
  ctx.moveTo(CX - 55, bodyTop);
  ctx.bezierCurveTo(CX - 74, bodyTop + 5, CX - 74, bodyTop + 20, CX - 72, bodyTop + 40);
  ctx.lineTo(CX - 70, bodyTop + bodyH - 20);
  ctx.quadraticCurveTo(CX - 70, bodyTop + bodyH, CX - 50, bodyTop + bodyH);
  ctx.lineTo(CX + 50, bodyTop + bodyH);
  ctx.quadraticCurveTo(CX + 70, bodyTop + bodyH, CX + 70, bodyTop + bodyH - 20);
  ctx.lineTo(CX + 72, bodyTop + 40);
  ctx.bezierCurveTo(CX + 74, bodyTop + 20, CX + 74, bodyTop + 5, CX + 55, bodyTop);
  ctx.closePath();
  ctx.fill();

  // Jacket edge highlight (left)
  const shineL = ctx.createLinearGradient(CX - 74, bodyTop, CX - 60, bodyTop);
  shineL.addColorStop(0, "rgba(255,255,255,0.06)");
  shineL.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shineL;
  ctx.beginPath();
  ctx.moveTo(CX - 55, bodyTop);
  ctx.bezierCurveTo(CX - 74, bodyTop + 5, CX - 74, bodyTop + 20, CX - 72, bodyTop + 40);
  ctx.lineTo(CX - 62, bodyTop + 40);
  ctx.lineTo(CX - 60, bodyTop + 20);
  ctx.bezierCurveTo(CX - 60, bodyTop + 8, CX - 52, bodyTop + 2, CX - 44, bodyTop);
  ctx.closePath();
  ctx.fill();

  // Collar / lapels
  ctx.strokeStyle = "rgba(124,108,255,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(CX - 22, bodyTop);
  ctx.bezierCurveTo(CX - 16, bodyTop + 18, CX - 6, bodyTop + 28, CX, bodyTop + 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CX + 22, bodyTop);
  ctx.bezierCurveTo(CX + 16, bodyTop + 18, CX + 6, bodyTop + 28, CX, bodyTop + 34);
  ctx.stroke();

  // Inner shirt (visible between lapels)
  ctx.fillStyle = "#0e0c1a";
  ctx.beginPath();
  ctx.moveTo(CX - 18, bodyTop);
  ctx.lineTo(CX, bodyTop + 32);
  ctx.lineTo(CX + 18, bodyTop);
  ctx.closePath();
  ctx.fill();

  // Meetzy badge pill
  const badgeX = CX - 30;
  const badgeY = bodyTop + 58;
  ctx.fillStyle = "rgba(124,108,255,0.14)";
  roundRect(ctx, badgeX, badgeY, 60, 22, 11);
  ctx.fill();
  ctx.strokeStyle = "rgba(124,108,255,0.45)";
  ctx.lineWidth = 1;
  roundRect(ctx, badgeX, badgeY, 60, 22, 11);
  ctx.stroke();
  ctx.fillStyle = "rgba(183,172,255,0.92)";
  ctx.font = `700 8.5px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MEETZY", CX, badgeY + 11);

  // ── ARMS ──────────────────────────────────────────────────
  // Left arm — tapers toward wrist at bottom
  ctx.fillStyle = "#131122";
  ctx.beginPath();
  ctx.moveTo(CX - 56, bodyTop + 12);
  ctx.bezierCurveTo(CX - 78, bodyTop + 22, CX - 86, bodyTop + 58, CX - 83, bodyTop + 92);
  ctx.quadraticCurveTo(CX - 82, bodyTop + 100, CX - 74, bodyTop + 99);
  ctx.quadraticCurveTo(CX - 66, bodyTop + 96, CX - 67, bodyTop + 86);
  ctx.bezierCurveTo(CX - 68, bodyTop + 54, CX - 60, bodyTop + 22, CX - 44, bodyTop + 10);
  ctx.closePath();
  ctx.fill();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(CX + 56, bodyTop + 12);
  ctx.bezierCurveTo(CX + 78, bodyTop + 22, CX + 86, bodyTop + 58, CX + 83, bodyTop + 92);
  ctx.quadraticCurveTo(CX + 82, bodyTop + 100, CX + 74, bodyTop + 99);
  ctx.quadraticCurveTo(CX + 66, bodyTop + 96, CX + 67, bodyTop + 86);
  ctx.bezierCurveTo(CX + 68, bodyTop + 54, CX + 60, bodyTop + 22, CX + 44, bodyTop + 10);
  ctx.closePath();
  ctx.fill();

  // ── HANDS (cartoon fist shapes) ───────────────────────────
  // Sleeve cuffs — jacket color overlapping wrist area
  ctx.fillStyle = "#131122";
  ctx.beginPath();
  ctx.ellipse(CX - 78, bodyTop + 96, 11, 7, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(CX + 78, bodyTop + 96, 11, 7, 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Left fist
  {
    const hx = CX - 78, hy = bodyTop + 102;
    const hg = ctx.createLinearGradient(hx - 13, hy - 10, hx + 5, hy + 12);
    hg.addColorStop(0, skinLight);
    hg.addColorStop(1, skinDark);
    ctx.fillStyle = hg;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-0.18);
    roundRect(ctx, -13, -10, 24, 18, 9);
    ctx.fill();
    // Knuckle lines
    ctx.strokeStyle = "rgba(155,85,45,0.22)";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (const x of [-4, 0, 4]) {
      ctx.beginPath();
      ctx.moveTo(x, -10);
      ctx.lineTo(x, -4);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Right fist
  {
    const hx = CX + 78, hy = bodyTop + 102;
    const hg = ctx.createLinearGradient(hx - 5, hy - 10, hx + 13, hy + 12);
    hg.addColorStop(0, skinLight);
    hg.addColorStop(1, skinDark);
    ctx.fillStyle = hg;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(0.18);
    roundRect(ctx, -11, -10, 24, 18, 9);
    ctx.fill();
    ctx.strokeStyle = "rgba(155,85,45,0.22)";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (const x of [-4, 0, 4]) {
      ctx.beginPath();
      ctx.moveTo(x, -10);
      ctx.lineTo(x, -4);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── NECK ──────────────────────────────────────────────────
  const neckGrad = ctx.createLinearGradient(CX - 15, 0, CX + 15, 0);
  neckGrad.addColorStop(0, skinDark);
  neckGrad.addColorStop(0.4, skin);
  neckGrad.addColorStop(0.6, skinLight);
  neckGrad.addColorStop(1, skinDark);
  ctx.fillStyle = neckGrad;
  roundRect(ctx, CX - 14, bodyTop - 34, 28, 40, 10);
  ctx.fill();

  // Neck shadow at collar
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(CX, bodyTop - 2, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── HEAD (with tilt) ──────────────────────────────────────
  ctx.save();
  ctx.translate(CX, headCY);
  ctx.rotate(tiltRad);

  // Subtle violet aura
  const aura = ctx.createRadialGradient(0, -10, 38, 0, -5, 90);
  aura.addColorStop(0, "rgba(124,108,255,0)");
  aura.addColorStop(0.7, "rgba(124,108,255,0.04)");
  aura.addColorStop(1, "rgba(124,108,255,0.12)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(0, -5, 90, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.13)";
  ctx.beginPath();
  ctx.ellipse(3, 6, 51, 61, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face base (radial gradient for 3D depth)
  const faceGrad = ctx.createRadialGradient(-10, -20, 8, 0, 0, 62);
  faceGrad.addColorStop(0, "#fde2b8");
  faceGrad.addColorStop(0.4, skin);
  faceGrad.addColorStop(0.75, "#e4a474");
  faceGrad.addColorStop(1, "#c88050");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 50, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw shadow
  const jawShadow = ctx.createLinearGradient(0, 32, 0, 58);
  jawShadow.addColorStop(0, "rgba(0,0,0,0)");
  jawShadow.addColorStop(1, "rgba(0,0,0,0.09)");
  ctx.fillStyle = jawShadow;
  ctx.beginPath();
  ctx.ellipse(0, 42, 36, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── EARS ──────────────────────────────────────────────────
  const makeEar = (ex: number) => {
    const g = ctx.createRadialGradient(ex < 0 ? ex + 4 : ex - 4, 0, 1, ex, 2, 14);
    g.addColorStop(0, "#f0b880");
    g.addColorStop(1, "#c07848");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ex, 2, 10, 14, ex < 0 ? 0.12 : -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(140,70,40,0.22)";
    ctx.beginPath();
    ctx.ellipse(ex, 3, 5, 8, ex < 0 ? 0.12 : -0.12, 0, Math.PI * 2);
    ctx.fill();
  };
  makeEar(-51);
  makeEar(51);

  // ── HAIR ──────────────────────────────────────────────────
  ctx.fillStyle = "#1a1208";

  // Main hair mass (top)
  ctx.beginPath();
  ctx.moveTo(-50, -10);
  ctx.bezierCurveTo(-56, -50, -32, -76, 0, -76);
  ctx.bezierCurveTo(32, -76, 56, -50, 50, -10);
  ctx.bezierCurveTo(36, -24, 18, -28, 0, -26);
  ctx.bezierCurveTo(-18, -28, -36, -24, -50, -10);
  ctx.closePath();
  ctx.fill();

  // Hair ellipse fill
  ctx.beginPath();
  ctx.ellipse(0, -36, 50, 33, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Sideburns
  ctx.beginPath();
  ctx.moveTo(-47, -10);
  ctx.bezierCurveTo(-58, 8, -56, 28, -52, 32);
  ctx.quadraticCurveTo(-48, 36, -44, 30);
  ctx.quadraticCurveTo(-42, 12, -44, -4);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(47, -10);
  ctx.bezierCurveTo(58, 8, 56, 28, 52, 32);
  ctx.quadraticCurveTo(48, 36, 44, 30);
  ctx.quadraticCurveTo(42, 12, 44, -4);
  ctx.closePath();
  ctx.fill();

  // Hair highlight
  const hairGlow = ctx.createRadialGradient(-16, -54, 2, -14, -50, 24);
  hairGlow.addColorStop(0, "rgba(255,255,255,0.1)");
  hairGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hairGlow;
  ctx.beginPath();
  ctx.ellipse(-14, -50, 22, 13, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // ── EYEBROWS ──────────────────────────────────────────────
  const browY = -22;
  const browLift = state.browRaise * 5;
  ctx.strokeStyle = "#1a1208";
  ctx.lineWidth = 3.8;
  ctx.lineCap = "round";

  // Left brow
  ctx.beginPath();
  ctx.moveTo(-30, browY - browLift);
  ctx.bezierCurveTo(-22, browY - 6 - browLift, -14, browY - 5 - browLift, -7, browY - 1 - browLift);
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(7, browY - 1 - browLift);
  ctx.bezierCurveTo(14, browY - 5 - browLift, 22, browY - 6 - browLift, 30, browY - browLift);
  ctx.stroke();

  // ── EYES ──────────────────────────────────────────────────
  const eyeY = -7;
  const LEX = -19;
  const REX = 19;
  const eyeW = 15.5;
  const eyeH = 13;
  const blinkH = Math.max(0.5, eyeH * (1 - state.blinkProgress));

  // Eye socket shadow
  ctx.fillStyle = "rgba(160,90,50,0.14)";
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY + 1, eyeW + 5, eyeH + 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY + 1, eyeW + 5, eyeH + 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye whites
  ctx.fillStyle = "#f8f6f2";
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY, eyeW, blinkH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY, eyeW, blinkH, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.blinkProgress < 0.92) {
    const maxOff = 4;
    const ox = Math.max(-maxOff, Math.min(maxOff, state.eyeOffsetX));
    const oy = Math.max(-maxOff, Math.min(maxOff, state.eyeOffsetY));
    const irisR = 9.5;
    const irisH = Math.min(irisR, blinkH * 0.9);

    // Iris glow (pre-draw blurred ring)
    const glowR = irisR + 3;
    const glowGL = ctx.createRadialGradient(LEX + ox, eyeY + oy, irisR - 1, LEX + ox, eyeY + oy, glowR + 4);
    glowGL.addColorStop(0, "rgba(124,108,255,0.35)");
    glowGL.addColorStop(1, "rgba(124,108,255,0)");
    ctx.fillStyle = glowGL;
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, glowR + 4, Math.min(glowR + 4, irisH + 4), 0, 0, Math.PI * 2);
    ctx.fill();

    const glowGR = ctx.createRadialGradient(REX + ox, eyeY + oy, irisR - 1, REX + ox, eyeY + oy, glowR + 4);
    glowGR.addColorStop(0, "rgba(124,108,255,0.35)");
    glowGR.addColorStop(1, "rgba(124,108,255,0)");
    ctx.fillStyle = glowGR;
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, glowR + 4, Math.min(glowR + 4, irisH + 4), 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris — violet (signature)
    const irisGradL = ctx.createRadialGradient(LEX + ox - 2.5, eyeY + oy - 2.5, 1, LEX + ox, eyeY + oy, irisR + 1);
    irisGradL.addColorStop(0, "#a99aff");
    irisGradL.addColorStop(0.45, "#7c6cff");
    irisGradL.addColorStop(0.8, "#5840d8");
    irisGradL.addColorStop(1, "#3a2aa8");
    ctx.fillStyle = irisGradL;
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.fill();

    const irisGradR = ctx.createRadialGradient(REX + ox - 2.5, eyeY + oy - 2.5, 1, REX + ox, eyeY + oy, irisR + 1);
    irisGradR.addColorStop(0, "#a99aff");
    irisGradR.addColorStop(0.45, "#7c6cff");
    irisGradR.addColorStop(0.8, "#5840d8");
    irisGradR.addColorStop(1, "#3a2aa8");
    ctx.fillStyle = irisGradR;
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris limbal ring
    ctx.strokeStyle = "rgba(40,25,120,0.5)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Pupil
    ctx.fillStyle = "#08060f";
    const pupilH = Math.min(6, irisH * 0.68);
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, 5.5, pupilH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, 5.5, pupilH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight (main)
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.beginPath();
    ctx.ellipse(LEX + ox - 3.5, eyeY + oy - 3.2, 3.8, Math.min(3.4, irisH * 0.38), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox - 3.5, eyeY + oy - 3.2, 3.8, Math.min(3.4, irisH * 0.38), 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight (small secondary)
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.beginPath();
    ctx.ellipse(LEX + ox + 3.2, eyeY + oy + 2.5, 1.8, Math.min(1.6, irisH * 0.22), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox + 3.2, eyeY + oy + 2.5, 1.8, Math.min(1.6, irisH * 0.22), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyelid (skin over eye during blink)
  const lidGrad = ctx.createLinearGradient(0, eyeY - eyeH, 0, eyeY + 2);
  lidGrad.addColorStop(0, skin);
  lidGrad.addColorStop(1, "#d49060");
  ctx.fillStyle = lidGrad;
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY - eyeH + (eyeH * 2 * state.blinkProgress), eyeW + 1, eyeH * state.blinkProgress + 2, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY - eyeH + (eyeH * 2 * state.blinkProgress), eyeW + 1, eyeH * state.blinkProgress + 2, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Lash line (top arc)
  ctx.strokeStyle = "rgba(15,8,5,0.75)";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY, eyeW, blinkH, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY, eyeW, blinkH, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // ── NOSE ──────────────────────────────────────────────────
  // Subtle: just bridge shadow + nostril dots
  ctx.strokeStyle = "rgba(150,85,45,0.18)";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-3, 5);
  ctx.bezierCurveTo(-7, 12, -7, 16, -5, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, 5);
  ctx.bezierCurveTo(7, 12, 7, 16, 5, 18);
  ctx.stroke();
  // Nostril dots
  ctx.fillStyle = "rgba(140,75,42,0.28)";
  ctx.beginPath();
  ctx.ellipse(-5.5, 18, 4.5, 3.2, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5.5, 18, 4.5, 3.2, -0.35, 0, Math.PI * 2);
  ctx.fill();

  // ── MOUTH ─────────────────────────────────────────────────
  const mouthY = 32;
  const mouthOpen = state.mouthOpenness;

  if (mouthOpen > 0.05) {
    // Speaking — open mouth with teeth
    ctx.fillStyle = "#2e0e0e";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthOpen * 5, 17, 5 + mouthOpen * 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Upper teeth
    ctx.fillStyle = "#f5f0e8";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthOpen * 1.5, 15, 3.5 + mouthOpen * 3, 0, 0, Math.PI);
    ctx.fill();
    // Lower teeth
    ctx.fillStyle = "#eae5dc";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthOpen * 9, 12, 2.5 + mouthOpen * 2, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  } else {
    // Natural smile — bezier curve
    ctx.strokeStyle = "#9a5040";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-17, mouthY);
    ctx.bezierCurveTo(-10, mouthY + 10, 10, mouthY + 10, 17, mouthY);
    ctx.stroke();
    // Upper lip cupid's bow shadow
    ctx.strokeStyle = "rgba(155,80,55,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-11, mouthY - 3);
    ctx.bezierCurveTo(-5, mouthY - 6, 5, mouthY - 6, 11, mouthY - 3);
    ctx.stroke();
    // Smile dimples
    ctx.fillStyle = "rgba(155,80,50,0.16)";
    ctx.beginPath();
    ctx.ellipse(-18, mouthY + 2, 3.5, 2.8, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, mouthY + 2, 3.5, 2.8, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheek blush
  ctx.fillStyle = "rgba(235,135,105,0.09)";
  ctx.beginPath();
  ctx.ellipse(-36, 16, 14, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(36, 16, 14, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // head tilt
  ctx.restore(); // breathe
  ctx.restore(); // dpr scale
}

// ── Component ─────────────────────────────────────────────
export default function MiloAvatar({
  size = 280,
  isSpeaking = false,
  mousePosition,
  containerRef,
  className = "",
}: MiloAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<MiloState>(createMiloState());
  const lastScrollY = useRef(0);
  const isSpeakingRef = useRef(isSpeaking);
  const mousePositionRef = useRef(mousePosition);
  const containerRefRef = useRef(containerRef);

  isSpeakingRef.current = isSpeaking;
  mousePositionRef.current = mousePosition;
  containerRefRef.current = containerRef;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;

    let rafId = 0;
    function animate() {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const ctx = canvasEl.getContext("2d");
      if (!ctx) return;

      const st = stateRef.current;
      const speaking = isSpeakingRef.current;
      const mp = mousePositionRef.current;
      st.frame++;

      st.breathePhase += 0.016;

      // Blink
      st.blinkTimer--;
      if (st.blinkTimer <= 0) {
        st.blinkTimer = 150 + Math.random() * 100;
        st.isBlinking = true;
        st.blinkProgress = 0;
      }
      if (st.isBlinking) {
        if (st.blinkProgress < 1) {
          st.blinkProgress = Math.min(1, st.blinkProgress + 0.18);
        } else {
          st.blinkProgress = Math.max(0, st.blinkProgress - 0.12);
          if (st.blinkProgress <= 0) {
            st.blinkProgress = 0;
            st.isBlinking = false;
          }
        }
      }

      // Head tilt
      st.headTiltTimer--;
      if (st.headTiltTimer <= 0) {
        st.headTiltTimer = 180 + Math.random() * 140;
        st.headTiltTarget = (Math.random() - 0.5) * 6;
      }
      st.headTilt += (st.headTiltTarget - st.headTilt) * 0.04;

      // Eye tracking
      if (mp && containerRefRef.current?.current) {
        const canvasRect = canvasEl.getBoundingClientRect();
        const charX = canvasRect.left + canvasRect.width / 2;
        const charY = canvasRect.top + canvasRect.height * 0.25;
        const dx = mp.x - charX;
        const dy = mp.y - charY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxInfluence = 420;
        const factor = dist < maxInfluence ? Math.min(1, dist / maxInfluence) : 0;
        st.eyeOffsetXTarget = (dx / Math.max(dist, 1)) * 4 * factor;
        st.eyeOffsetYTarget = (dy / Math.max(dist, 1)) * 3 * factor;
      } else {
        st.eyeOffsetXTarget = 0;
        st.eyeOffsetYTarget = 0;
      }
      st.eyeOffsetX += (st.eyeOffsetXTarget - st.eyeOffsetX) * 0.08;
      st.eyeOffsetY += (st.eyeOffsetYTarget - st.eyeOffsetY) * 0.08;

      // Mouth animation
      if (speaking) {
        st.mouthOpenness = 0.4 + Math.sin(st.frame * 0.22) * 0.35;
      } else {
        st.mouthOpenness = Math.max(0, st.mouthOpenness - 0.06);
      }

      // Scroll reaction
      const scrollNow = window.scrollY;
      const scrollDelta = Math.abs(scrollNow - lastScrollY.current);
      if (scrollDelta > 30) {
        st.headTiltTarget = scrollDelta > 80 ? (Math.random() > 0.5 ? 4 : -4) : 0;
        st.headTiltTimer = 60;
      }
      lastScrollY.current = scrollNow;

      st.browRaise += ((speaking ? 0.5 : 0) - st.browRaise) * 0.05;

      drawMilo(ctx, st, dpr);
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const h = Math.round(size * (CH / CW));

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: h }}
      className={className}
    />
  );
}

// ── Small version for chat header / FAB ───────────────────
export function MiloAvatarSmall({
  size = 40,
  isSpeaking = false,
}: {
  size?: number;
  isSpeaking?: boolean;
}) {
  return (
    <MiloAvatar
      size={size}
      isSpeaking={isSpeaking}
      className="rounded-full"
    />
  );
}
