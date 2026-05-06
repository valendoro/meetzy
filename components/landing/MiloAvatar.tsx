"use client";

import { useCallback, useEffect, useRef } from "react";

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
  // Idle
  frame: number;
  breathePhase: number;      // 0-2π
  blinkTimer: number;        // frames until next blink
  blinkProgress: number;     // 0 = open, 1 = closed
  isBlinking: boolean;
  headTiltTimer: number;
  headTilt: number;          // degrees, -5 to 5
  headTiltTarget: number;

  // Reactive
  eyeOffsetX: number;
  eyeOffsetY: number;
  eyeOffsetXTarget: number;
  eyeOffsetYTarget: number;
  mouthOpenness: number;     // 0-1 when speaking
  lastScrollEvent: number;   // timestamp of last fast scroll
  browRaise: number;         // 0-1
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

// ── Drawing ───────────────────────────────────────────────

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

function drawMilo(
  ctx: CanvasRenderingContext2D,
  state: MiloState,
  dpr: number
) {
  const s = dpr;
  ctx.clearRect(0, 0, CW * s, CH * s);
  ctx.save();
  ctx.scale(s, s);

  // ── Breathe transform ─────────────────────────────────
  const breatheScale = 1 + Math.sin(state.breathePhase) * 0.006;
  ctx.save();
  ctx.translate(CX, CH * 0.5);
  ctx.scale(breatheScale, breatheScale);
  ctx.translate(-CX, -CH * 0.5);

  // ── Head tilt ─────────────────────────────────────────
  const headY = 88;
  const tiltRad = (state.headTilt * Math.PI) / 180;

  // ── BODY — black t-shirt ──────────────────────────────
  const bodyTop = 175;
  const bodyBottom = 340;
  const bodyLeft = CX - 72;
  const bodyRight = CX + 72;

  // Shadow under body
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(CX, bodyBottom + 12, 65, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shirt body
  ctx.fillStyle = "#111114";
  ctx.beginPath();
  ctx.moveTo(bodyLeft + 12, bodyTop);
  ctx.lineTo(bodyRight - 12, bodyTop);
  ctx.quadraticCurveTo(bodyRight, bodyTop, bodyRight, bodyTop + 12);
  ctx.lineTo(bodyRight, bodyBottom - 16);
  ctx.quadraticCurveTo(bodyRight, bodyBottom, bodyRight - 16, bodyBottom);
  ctx.lineTo(bodyLeft + 16, bodyBottom);
  ctx.quadraticCurveTo(bodyLeft, bodyBottom, bodyLeft, bodyBottom - 16);
  ctx.lineTo(bodyLeft, bodyTop + 12);
  ctx.quadraticCurveTo(bodyLeft, bodyTop, bodyLeft + 12, bodyTop);
  ctx.closePath();
  ctx.fill();

  // Shirt collar V-shape
  ctx.fillStyle = "#1a1a20";
  ctx.beginPath();
  ctx.moveTo(CX - 18, bodyTop);
  ctx.lineTo(CX, bodyTop + 22);
  ctx.lineTo(CX + 18, bodyTop);
  ctx.closePath();
  ctx.fill();

  // MEETZY text on shirt
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `bold ${12}px 'Syne', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "2px";
  ctx.fillText("MEETZY", CX, 248);
  // M logo mark (small, left chest)
  ctx.fillStyle = "rgba(99,102,241,0.9)";
  ctx.font = `bold ${9}px 'Syne', sans-serif`;
  ctx.fillText("M", CX - 42, 225);
  ctx.restore();

  // Shirt sleeve lines (subtle texture)
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bodyLeft, bodyTop + 50);
  ctx.lineTo(bodyLeft + 20, bodyTop + 50);
  ctx.moveTo(bodyRight, bodyTop + 50);
  ctx.lineTo(bodyRight - 20, bodyTop + 50);
  ctx.stroke();

  // ── ARMS ──────────────────────────────────────────────
  const armColor = "#111114";
  // Left arm
  ctx.fillStyle = armColor;
  roundRect(ctx, bodyLeft - 20, bodyTop + 8, 22, 90, 11);
  ctx.fill();
  // Right arm
  roundRect(ctx, bodyRight - 2, bodyTop + 8, 22, 90, 11);
  ctx.fill();

  // Hands (skin color)
  const skinBase = "#d4956a";
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(bodyLeft - 9, bodyTop + 105, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bodyRight + 11, bodyTop + 105, 12, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── NECK ──────────────────────────────────────────────
  ctx.fillStyle = skinBase;
  roundRect(ctx, CX - 13, bodyTop - 30, 26, 38, 8);
  ctx.fill();

  // ── HEAD (with tilt) ──────────────────────────────────
  ctx.save();
  ctx.translate(CX, headY);
  ctx.rotate(tiltRad);

  // Head base shadow
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(2, 3, 52, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(0, 0, 50, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jaw / chin shadow
  const jawGrad = ctx.createLinearGradient(0, 30, 0, 58);
  jawGrad.addColorStop(0, "rgba(0,0,0,0)");
  jawGrad.addColorStop(1, "rgba(0,0,0,0.08)");
  ctx.fillStyle = jawGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 50, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = "#c5885e";
  ctx.beginPath();
  ctx.ellipse(-51, 0, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(51, 0, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Inner ear
  ctx.fillStyle = "#b87050";
  ctx.beginPath();
  ctx.ellipse(-51, 0, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(51, 0, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── HAIR ──────────────────────────────────────────────
  ctx.fillStyle = "#1a1008";
  // Main hair mass
  ctx.beginPath();
  ctx.ellipse(0, -36, 50, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hair extends over forehead
  ctx.beginPath();
  ctx.moveTo(-50, -10);
  ctx.quadraticCurveTo(-52, -55, 0, -60);
  ctx.quadraticCurveTo(52, -55, 50, -10);
  ctx.quadraticCurveTo(30, -20, 0, -22);
  ctx.quadraticCurveTo(-30, -20, -50, -10);
  ctx.fill();
  // Hair highlight
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath();
  ctx.ellipse(-10, -48, 18, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── EYEBROWS ──────────────────────────────────────────
  const browY = -22;
  const browRaiseAmt = state.browRaise * 4;
  ctx.strokeStyle = "#1a1008";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  // Left brow
  ctx.beginPath();
  ctx.moveTo(-28, browY - browRaiseAmt);
  ctx.quadraticCurveTo(-16, browY - 4 - browRaiseAmt, -8, browY - 1 - browRaiseAmt);
  ctx.stroke();
  // Right brow
  ctx.beginPath();
  ctx.moveTo(8, browY - 1 - browRaiseAmt);
  ctx.quadraticCurveTo(16, browY - 4 - browRaiseAmt, 28, browY - browRaiseAmt);
  ctx.stroke();

  // ── EYES ──────────────────────────────────────────────
  const eyeY = -8;
  const LEX = -18; // left eye x
  const REX = 18;  // right eye x
  const eyeH = 12; // eye radius
  const blinkH = eyeH * (1 - state.blinkProgress); // shrinks to 0 when blinking

  // Eye whites
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY, 14, blinkH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY, 14, blinkH, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.blinkProgress < 0.95) {
    // Iris
    const irisColor = "#3d2b1a";
    const maxOff = 4;
    const ox = Math.max(-maxOff, Math.min(maxOff, state.eyeOffsetX));
    const oy = Math.max(-maxOff, Math.min(maxOff, state.eyeOffsetY));

    ctx.fillStyle = irisColor;
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, 8, Math.min(8, blinkH * 0.85), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, 8, Math.min(8, blinkH * 0.85), 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#0a0806";
    ctx.beginPath();
    ctx.ellipse(LEX + ox, eyeY + oy, 5, Math.min(5, blinkH * 0.6), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox, eyeY + oy, 5, Math.min(5, blinkH * 0.6), 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.ellipse(LEX + ox - 3, eyeY + oy - 3, 3, Math.min(3, blinkH * 0.35), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(REX + ox - 3, eyeY + oy - 3, 3, Math.min(3, blinkH * 0.35), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyelid (top)
  ctx.fillStyle = skinBase;
  ctx.beginPath();
  ctx.ellipse(LEX, eyeY - eyeH + (eyeH * 2 * state.blinkProgress), 15, eyeH * state.blinkProgress + 2, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(REX, eyeY - eyeH + (eyeH * 2 * state.blinkProgress), 15, eyeH * state.blinkProgress + 2, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // ── NOSE ──────────────────────────────────────────────
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 5);
  ctx.quadraticCurveTo(-8, 14, -5, 18);
  ctx.moveTo(4, 5);
  ctx.quadraticCurveTo(8, 14, 5, 18);
  ctx.stroke();
  // Nose bridge bottom
  ctx.beginPath();
  ctx.moveTo(-6, 18);
  ctx.quadraticCurveTo(0, 21, 6, 18);
  ctx.stroke();

  // ── MOUTH ─────────────────────────────────────────────
  const mouthY = 32;
  const mouthW = 18;
  const open = state.mouthOpenness;

  if (open > 0.05) {
    // Speaking — open mouth
    ctx.fillStyle = "#4a1a1a";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + open * 4, mouthW, 3 + open * 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Teeth
    ctx.fillStyle = "#f5f0e8";
    ctx.beginPath();
    ctx.ellipse(0, mouthY + open * 2, mouthW - 3, 2 + open * 3, 0, 0, Math.PI);
    ctx.fill();
  } else {
    // Slight smile
    ctx.strokeStyle = "#8a4030";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-mouthW, mouthY);
    ctx.quadraticCurveTo(0, mouthY + 8, mouthW, mouthY);
    ctx.stroke();
    // Smile corners
    ctx.beginPath();
    ctx.moveTo(-mouthW, mouthY);
    ctx.quadraticCurveTo(-mouthW - 3, mouthY - 3, -mouthW - 1, mouthY - 7);
    ctx.moveTo(mouthW, mouthY);
    ctx.quadraticCurveTo(mouthW + 3, mouthY - 3, mouthW + 1, mouthY - 7);
    ctx.stroke();
  }

  // Cheeks (subtle)
  ctx.fillStyle = "rgba(220,120,100,0.12)";
  ctx.beginPath();
  ctx.ellipse(-34, 16, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(34, 16, 12, 8, 0, 0, Math.PI * 2);
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
  const rafRef = useRef<number>(0);
  const lastScrollY = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const st = stateRef.current;
    st.frame++;

    // ── Breathe ────────────────────────────────────────
    st.breathePhase += 0.018;

    // ── Blink ──────────────────────────────────────────
    st.blinkTimer--;
    if (st.blinkTimer <= 0) {
      st.blinkTimer = 150 + Math.random() * 100;
      st.isBlinking = true;
    }
    if (st.isBlinking) {
      if (st.blinkProgress < 1) {
        st.blinkProgress = Math.min(1, st.blinkProgress + 0.18);
      } else {
        st.blinkProgress = Math.max(0, st.blinkProgress - 0.12);
        if (st.blinkProgress === 0) st.isBlinking = false;
      }
    }

    // ── Head tilt ──────────────────────────────────────
    st.headTiltTimer--;
    if (st.headTiltTimer <= 0) {
      st.headTiltTimer = 180 + Math.random() * 140;
      st.headTiltTarget = (Math.random() - 0.5) * 6;
    }
    st.headTilt += (st.headTiltTarget - st.headTilt) * 0.04;

    // ── Eye tracking (mouse follow) ─────────────────────
    if (mousePosition && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const charX = canvasRect.left + canvasRect.width / 2;
      const charY = canvasRect.top + canvasRect.height * 0.25; // head position

      const dx = mousePosition.x - charX;
      const dy = mousePosition.y - charY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxInfluence = 400;
      const factor = Math.min(1, dist / maxInfluence) * (dist < maxInfluence ? 1 : 0);
      st.eyeOffsetXTarget = (dx / Math.max(dist, 1)) * 4 * factor;
      st.eyeOffsetYTarget = (dy / Math.max(dist, 1)) * 3 * factor;
    } else {
      st.eyeOffsetXTarget = 0;
      st.eyeOffsetYTarget = 0;
    }
    st.eyeOffsetX += (st.eyeOffsetXTarget - st.eyeOffsetX) * 0.08;
    st.eyeOffsetY += (st.eyeOffsetYTarget - st.eyeOffsetY) * 0.08;

    // ── Speaking mouth ─────────────────────────────────
    if (isSpeaking) {
      st.mouthOpenness = 0.4 + Math.sin(st.frame * 0.22) * 0.35;
    } else {
      st.mouthOpenness = Math.max(0, st.mouthOpenness - 0.06);
    }

    // ── Scroll reaction ────────────────────────────────
    const scrollNow = window.scrollY;
    const scrollDelta = Math.abs(scrollNow - lastScrollY.current);
    if (scrollDelta > 30) {
      st.headTiltTarget = scrollDelta > 80 ? (Math.random() > 0.5 ? 4 : -4) : 0;
      st.headTiltTimer = 60;
    }
    lastScrollY.current = scrollNow;

    // ── Brow raise on speaking ─────────────────────────
    st.browRaise += ((isSpeaking ? 0.5 : 0) - st.browRaise) * 0.05;

    drawMilo(ctx, st, dpr);
    rafRef.current = requestAnimationFrame(animate);
  }, [isSpeaking, mousePosition, containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * (CH / CW)}px`;

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, size]);

  const h = Math.round(size * (CH / CW));

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: h }}
      className={className}
    />
  );
}

// ── Small version for chat header ─────────────────────────
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
