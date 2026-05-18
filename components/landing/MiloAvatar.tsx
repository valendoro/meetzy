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

  // Skin palette — warmer, more saturated
  const skin = "#f5c285";
  const skinDark = "#d98a55";
  const skinLight = "#fde0b5";

  // ── BODY ──────────────────────────────────────────────────
  const bodyTop = 178;
  const bodyH = 162;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(CX, bodyTop + bodyH + 6, 60, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jacket — dark navy/violet
  const jacketGrad = ctx.createLinearGradient(CX - 74, bodyTop, CX + 74, bodyTop + bodyH);
  jacketGrad.addColorStop(0, "#1e1c30");
  jacketGrad.addColorStop(0.45, "#141228");
  jacketGrad.addColorStop(1, "#0d0b1c");
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
  const shineL = ctx.createLinearGradient(CX - 74, bodyTop, CX - 58, bodyTop);
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

  // Collar / lapels — violet accent
  ctx.strokeStyle = "rgba(140,120,255,0.6)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(CX - 22, bodyTop);
  ctx.bezierCurveTo(CX - 16, bodyTop + 18, CX - 6, bodyTop + 28, CX, bodyTop + 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(CX + 22, bodyTop);
  ctx.bezierCurveTo(CX + 16, bodyTop + 18, CX + 6, bodyTop + 28, CX, bodyTop + 34);
  ctx.stroke();

  // Inner shirt
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
  ctx.fillStyle = "rgba(124,108,255,0.16)";
  roundRect(ctx, badgeX, badgeY, 60, 22, 11);
  ctx.fill();
  ctx.strokeStyle = "rgba(140,120,255,0.5)";
  ctx.lineWidth = 1;
  roundRect(ctx, badgeX, badgeY, 60, 22, 11);
  ctx.stroke();
  ctx.fillStyle = "rgba(195,185,255,0.95)";
  ctx.font = `700 8.5px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MEETZY", CX, badgeY + 11);

  // ── ARMS ──────────────────────────────────────────────────
  ctx.fillStyle = "#131122";
  // Left arm
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

  // ── HANDS ────────────────────────────────────────────────
  // Sleeve cuff overlap
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
    ctx.strokeStyle = "rgba(155,85,45,0.18)";
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
    ctx.strokeStyle = "rgba(155,85,45,0.18)";
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

  // ── NECK — wider for better proportions ───────────────────
  const neckGrad = ctx.createLinearGradient(CX - 18, 0, CX + 18, 0);
  neckGrad.addColorStop(0, skinDark);
  neckGrad.addColorStop(0.35, skin);
  neckGrad.addColorStop(0.65, skinLight);
  neckGrad.addColorStop(1, skinDark);
  ctx.fillStyle = neckGrad;
  roundRect(ctx, CX - 18, bodyTop - 36, 36, 42, 12);
  ctx.fill();

  // Neck-collar shadow
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.ellipse(CX, bodyTop - 2, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── HEAD (with tilt) ──────────────────────────────────────
  ctx.save();
  ctx.translate(CX, headCY);
  ctx.rotate(tiltRad);

  // Subtle violet aura
  const aura = ctx.createRadialGradient(0, -8, 40, 0, -4, 92);
  aura.addColorStop(0, "rgba(124,108,255,0)");
  aura.addColorStop(0.72, "rgba(124,108,255,0.04)");
  aura.addColorStop(1, "rgba(124,108,255,0.12)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(0, -4, 92, 100, 0, 0, Math.PI * 2);
  ctx.fill();

  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.11)";
  ctx.beginPath();
  ctx.ellipse(3, 6, 53, 62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face base — rounder, cleaner, friendlier
  const faceGrad = ctx.createRadialGradient(-12, -20, 6, 0, 0, 62);
  faceGrad.addColorStop(0, "#fde8c5");
  faceGrad.addColorStop(0.42, skin);
  faceGrad.addColorStop(0.78, "#e0955e");
  faceGrad.addColorStop(1, "#c07448");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  // Rounder face — wider rx, rounder overall
  ctx.ellipse(0, 2, 53, 57, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw shadow
  const jawShadow = ctx.createLinearGradient(0, 34, 0, 58);
  jawShadow.addColorStop(0, "rgba(0,0,0,0)");
  jawShadow.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = jawShadow;
  ctx.beginPath();
  ctx.ellipse(0, 44, 38, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── EARS ──────────────────────────────────────────────────
  const makeEar = (ex: number) => {
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(ex, 4, 10, 13, ex < 0 ? 0.1 : -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = "rgba(185,108,62,0.2)";
    ctx.beginPath();
    ctx.ellipse(ex, 5, 5, 7, ex < 0 ? 0.1 : -0.1, 0, Math.PI * 2);
    ctx.fill();
  };
  makeEar(-53);
  makeEar(53);

  // ── HAIR — clean cartoon style ────────────────────────────
  ctx.fillStyle = "#1a1208";

  // Main hair mass
  ctx.beginPath();
  ctx.moveTo(-52, -6);
  ctx.bezierCurveTo(-58, -48, -36, -78, 0, -78);
  ctx.bezierCurveTo(36, -78, 58, -48, 52, -6);
  ctx.bezierCurveTo(38, -22, 20, -28, 0, -26);
  ctx.bezierCurveTo(-20, -28, -38, -22, -52, -6);
  ctx.closePath();
  ctx.fill();

  // Hair cap fill
  ctx.beginPath();
  ctx.ellipse(0, -38, 51, 36, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Slight hair volume on sides (no sideburns — too realistic)
  ctx.beginPath();
  ctx.moveTo(-51, -6);
  ctx.bezierCurveTo(-60, 4, -58, 16, -53, 20);
  ctx.quadraticCurveTo(-50, 24, -47, 18);
  ctx.quadraticCurveTo(-46, 8, -48, -2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(51, -6);
  ctx.bezierCurveTo(60, 4, 58, 16, 53, 20);
  ctx.quadraticCurveTo(50, 24, 47, 18);
  ctx.quadraticCurveTo(46, 8, 48, -2);
  ctx.closePath();
  ctx.fill();

  // Hair highlight — soft sheen
  const hairShine = ctx.createRadialGradient(-16, -56, 1, -14, -52, 22);
  hairShine.addColorStop(0, "rgba(255,255,255,0.13)");
  hairShine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hairShine;
  ctx.beginPath();
  ctx.ellipse(-14, -52, 20, 12, -0.32, 0, Math.PI * 2);
  ctx.fill();

  // ── EYEBROWS ── cleaner, friendlier arch ──────────────────
  const browY = -25;
  const browLift = state.browRaise * 5;
  ctx.strokeStyle = "#2a1c0e";
  ctx.lineWidth = 3.6;
  ctx.lineCap = "round";
  // Left brow — natural arch
  ctx.beginPath();
  ctx.moveTo(-29, browY - browLift);
  ctx.bezierCurveTo(-21, browY - 6 - browLift, -13, browY - 5.5 - browLift, -7, browY - 1.5 - browLift);
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(7, browY - 1.5 - browLift);
  ctx.bezierCurveTo(13, browY - 5.5 - browLift, 21, browY - 6 - browLift, 29, browY - browLift);
  ctx.stroke();

  // ── EYES — bigger, rounder, OPEN ─────────────────────────
  // Key changes: eyeH > eyeW (portrait oval = friendly), no resting eyelid
  const eyeY = -7;
  const LEX = -20;
  const REX = 20;
  const eyeW = 13.5;   // narrower base
  const eyeH = 17;     // TALLER — portrait oval gives open, cute look
  const blinkH = Math.max(0.5, eyeH * (1 - state.blinkProgress));

  // Eye socket shadow (very subtle)
  ctx.fillStyle = "rgba(155,85,48,0.1)";
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY + 1, eyeW + 4, eyeH + 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY + 1, eyeW + 4, eyeH + 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye whites — bright, clean
  ctx.fillStyle = "#fffef8";
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY, eyeW, blinkH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY, eyeW, blinkH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye outline — thin, clean
  ctx.strokeStyle = "rgba(50,25,8,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY, eyeW, blinkH, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY, eyeW, blinkH, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (state.blinkProgress < 0.92) {
    const maxOff = 4;
    const ox = Math.max(-maxOff, Math.min(maxOff, state.eyeOffsetX));
    const oy = Math.max(-maxOff, Math.min(maxOff, state.eyeOffsetY));
    const irisR = 11;
    const irisH = Math.min(irisR, blinkH * 0.88);

    // Iris glow ring
    const glowGL = ctx.createRadialGradient(LEX + ox, eyeY + oy, irisR - 1, LEX + ox, eyeY + oy, irisR + 5);
    glowGL.addColorStop(0, "rgba(124,108,255,0.3)");
    glowGL.addColorStop(1, "rgba(124,108,255,0)");
    ctx.fillStyle = glowGL;
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, irisR + 5, Math.min(irisR + 5, irisH + 5), 0, 0, Math.PI * 2);
    ctx.fill();
    const glowGR = ctx.createRadialGradient(REX + ox, eyeY + oy, irisR - 1, REX + ox, eyeY + oy, irisR + 5);
    glowGR.addColorStop(0, "rgba(124,108,255,0.3)");
    glowGR.addColorStop(1, "rgba(124,108,255,0)");
    ctx.fillStyle = glowGR;
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, irisR + 5, Math.min(irisR + 5, irisH + 5), 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris — violet (signature)
    const irisGL = ctx.createRadialGradient(LEX + ox - 2.5, eyeY + oy - 2.5, 1, LEX + ox, eyeY + oy, irisR + 1);
    irisGL.addColorStop(0, "#b8aaff");
    irisGL.addColorStop(0.42, "#7c6cff");
    irisGL.addColorStop(0.78, "#5535e0");
    irisGL.addColorStop(1, "#3620b0");
    ctx.fillStyle = irisGL;
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.fill();

    const irisGR = ctx.createRadialGradient(REX + ox - 2.5, eyeY + oy - 2.5, 1, REX + ox, eyeY + oy, irisR + 1);
    irisGR.addColorStop(0, "#b8aaff");
    irisGR.addColorStop(0.42, "#7c6cff");
    irisGR.addColorStop(0.78, "#5535e0");
    irisGR.addColorStop(1, "#3620b0");
    ctx.fillStyle = irisGR;
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris limbal ring
    ctx.strokeStyle = "rgba(30,18,100,0.45)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, irisR, irisH, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Pupil
    ctx.fillStyle = "#06040e";
    const pupilH = Math.min(7, irisH * 0.68);
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, 6, pupilH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, 6, pupilH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight (main — bright upper-left)
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.ellipse(LEX + ox - 3.8, eyeY + oy - 4, 4.2, Math.min(3.8, irisH * 0.38), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox - 3.8, eyeY + oy - 4, 4.2, Math.min(3.8, irisH * 0.38), 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight (small secondary — lower-right)
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.beginPath();
    ctx.ellipse(LEX + ox + 3.5, eyeY + oy + 2.8, 2, Math.min(1.8, irisH * 0.2), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox + 3.5, eyeY + oy + 2.8, 2, Math.min(1.8, irisH * 0.2), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyelid — ONLY drawn when actually blinking (fixes "sleepy at rest" bug)
  if (state.blinkProgress > 0.01) {
    const lidGrad = ctx.createLinearGradient(0, eyeY - eyeH, 0, eyeY + 2);
    lidGrad.addColorStop(0, skin);
    lidGrad.addColorStop(1, "#d08555");
    ctx.fillStyle = lidGrad;
    const lidCY = eyeY - eyeH + eyeH * 2 * state.blinkProgress;
    const lidH = Math.max(0, eyeH * state.blinkProgress);
    ctx.beginPath();
    ctx.ellipse(LEX, lidCY, eyeW + 1.5, lidH, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX, lidCY, eyeW + 1.5, lidH, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Top lash line — thinner, lighter stroke (not the "heavy lid" look)
  ctx.strokeStyle = "rgba(18,8,4,0.55)";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY, eyeW, blinkH, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY, eyeW, blinkH, 0, Math.PI, Math.PI * 2);
  ctx.stroke();

  // ── NOSE — cute button, minimal ───────────────────────────
  // Just two soft nostril dots — clean cartoon style
  ctx.fillStyle = "rgba(155,88,50,0.24)";
  ctx.beginPath();
  ctx.ellipse(-5, 18, 4.5, 3, 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5, 18, 4.5, 3, -0.32, 0, Math.PI * 2);
  ctx.fill();

  // ── MOUTH ─────────────────────────────────────────────────
  const mouthY = 33;
  const mouthOpen = state.mouthOpenness;

  if (mouthOpen > 0.05) {
    // Speaking — open mouth with teeth
    ctx.fillStyle = "#2a0c0c";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthOpen * 5, 16, 4.5 + mouthOpen * 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // Upper teeth
    ctx.fillStyle = "#f5f0e8";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthOpen * 1.5, 14, 3 + mouthOpen * 3, 0, 0, Math.PI);
    ctx.fill();
    // Lower teeth
    ctx.fillStyle = "#eae5dc";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthOpen * 9, 11, 2 + mouthOpen * 2, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  } else {
    // Friendly smile — wider, more cheerful
    ctx.strokeStyle = "#8a3a30";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-15, mouthY);
    ctx.bezierCurveTo(-8, mouthY + 11, 8, mouthY + 11, 15, mouthY);
    ctx.stroke();
    // Dimples
    ctx.fillStyle = "rgba(215,120,85,0.18)";
    ctx.beginPath();
    ctx.ellipse(-17, mouthY + 2, 3.5, 2.8, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(17, mouthY + 2, 3.5, 2.8, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheek blush — warm, subtle
  ctx.fillStyle = "rgba(235,130,100,0.11)";
  ctx.beginPath();
  ctx.ellipse(-36, 16, 14, 9, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(36, 16, 14, 9, -0.15, 0, Math.PI * 2);
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
