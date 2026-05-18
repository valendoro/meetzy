"use client";

/**
 * BrandAvatar — SVG character system
 *
 * 4 base characters (alex, sam, jordan, mia) × N brand colors
 * Animations: idle float, wave greeting, thinking (while user types), talking (while speaking)
 * Clothing layer automatically takes the agent's brandColor + shows brandName badge
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────
export type AvatarCharacter = "alex" | "sam" | "jordan" | "mia";
export type AvatarAnim      = "idle" | "wave" | "thinking" | "talking";

export interface BrandAvatarProps {
  character?    : AvatarCharacter;
  brandColor?   : string;
  brandName?    : string;
  animation?    : AvatarAnim;
  isSpeaking?   : boolean;
  size?         : number;
  className?    : string;
  /** Optional mouse position for eye tracking (from parent useMousePosition) */
  mousePosition?: { x: number; y: number };
  /** Ref of the container element, used to compute eye tracking offset */
  containerRef? : React.RefObject<HTMLDivElement | null>;
}

// ── Character palette definitions ─────────────────────────
interface CharDef {
  skin : string; skinD : string; skinL : string;
  hair : string; hairHL: string;
  eye  : string;
  label: string;
}

export const AVATAR_CHARS: Record<AvatarCharacter, CharDef> = {
  alex: {
    skin:"#f5c285", skinD:"#d98a55", skinL:"#fde8bc",
    hair:"#1a1208", hairHL:"rgba(255,255,255,0.13)",
    eye:"#5840d8",
    label:"Alex",
  },
  sam: {
    skin:"#bf7840", skinD:"#8a5028", skinL:"#d8a070",
    hair:"#120808", hairHL:"rgba(255,255,255,0.07)",
    eye:"#6a3010",
    label:"Sam",
  },
  jordan: {
    skin:"#fde0b5", skinD:"#d4a870", skinL:"#fff5e0",
    hair:"#c8a050", hairHL:"rgba(255,255,255,0.25)",
    eye:"#2850a0",
    label:"Jordan",
  },
  mia: {
    skin:"#d4906a", skinD:"#a06038", skinL:"#e8b090",
    hair:"#1e0c06", hairHL:"rgba(255,255,255,0.09)",
    eye:"#2d1a06",
    label:"Mia",
  },
};

// ── SVG viewBox constants ─────────────────────────────────
// All head elements use head-local coords (0,0 = face center).
// Head is translated to (100, 84) in SVG space.
const VW = 200;
const VH = 280;
const HX = 100; // head SVG x
const HY = 84;  // head SVG y

// ── Hair components ────────────────────────────────────────
// "back" layer renders behind face (long side pieces etc.)
function HairBack({ c, ch }: { c: AvatarCharacter; ch: CharDef }) {
  if (c === "mia") {
    // Long hair — side pieces hang behind face
    return (
      <path
        d="M -42,-8 Q -56,8 -54,52 Q -50,60 -44,54 Q -38,48 -40,32 Q -42,12 -40,0 Z
           M  42,-8 Q  56,8  54,52 Q  50,60  44,54 Q  38,48  40,32 Q  42,12  40,0 Z"
        fill={ch.hair}
      />
    );
  }
  return null;
}

function HairFront({ c, ch }: { c: AvatarCharacter; ch: CharDef }) {
  const h = ch.hair;
  const hl = ch.hairHL;

  if (c === "alex") {
    // Short bowl cut — clean and classic
    return (
      <>
        <ellipse cx="0" cy="-30" rx="43" ry="26" fill={h} />
        <path d="M -43,-8 Q -53,-46 0,-54 Q 53,-46 43,-8 Q 30,-22 0,-20 Q -30,-22 -43,-8 Z" fill={h} />
        {/* Side volume near ears */}
        <path d="M -43,-8 Q -51,2 -49,14 Q -46,18 -42,12 Q -40,4 -40,0 Z" fill={h} />
        <path d="M  43,-8 Q  51,2  49,14 Q  46,18  42,12 Q  40,4  40,0 Z" fill={h} />
        {/* Shine */}
        <ellipse cx="-14" cy="-42" rx="14" ry="7" fill={hl} />
      </>
    );
  }

  if (c === "sam") {
    // Tight curly / afro — wider, puffier
    return (
      <>
        <ellipse cx="0"   cy="-34" rx="50" ry="40" fill={h} />
        <ellipse cx="-46" cy="-22" rx="14" ry="20" fill={h} />
        <ellipse cx=" 46" cy="-22" rx="14" ry="20" fill={h} />
        <path d="M -50,-4 Q -60,-50 0,-64 Q 60,-50 50,-4 Q 34,-26 0,-24 Q -34,-26 -50,-4 Z" fill={h} />
        <ellipse cx="-10" cy="-46" rx="12" ry="6" fill={hl} />
      </>
    );
  }

  if (c === "jordan") {
    // Blonde wavy — swept slightly to the right
    return (
      <>
        <path
          d="M -42,-8 Q -54,-50 -2,-60 Q 32,-62 48,-44 Q 60,-26 50,-6
             Q 36,-20 2,-18 Q -24,-20 -42,-8 Z"
          fill={h}
        />
        {/* Right wave */}
        <path d="M 50,-6 Q 58,4 56,18 Q 52,24 48,18 Q 46,6 46,2 Z" fill={h} />
        {/* Left small piece */}
        <path d="M -42,-8 Q -50,0 -48,12 Q -45,16 -42,10 Q -40,2 -38,-2 Z" fill={h} />
        {/* Blonde shine — brighter */}
        <ellipse cx="-6" cy="-42" rx="18" ry="9" fill={hl} />
      </>
    );
  }

  // mia — long dark hair (front/top only; back pieces handled by HairBack)
  return (
    <>
      <ellipse cx="0" cy="-32" rx="43" ry="30" fill={h} />
      <path d="M -43,-8 Q -56,-48 0,-60 Q 56,-48 43,-8 Q 30,-24 0,-22 Q -30,-24 -43,-8 Z" fill={h} />
      <ellipse cx="-12" cy="-48" rx="12" ry="6" fill={hl} />
    </>
  );
}

// ── Face features ─────────────────────────────────────────
function Eyes({
  ch, blinking, eyeOX = 0, eyeOY = 0,
}: {
  ch: CharDef; blinking: boolean; eyeOX?: number; eyeOY?: number;
}) {
  const blinkH = blinking ? 0.5 : 14; // eye vertical radius collapses on blink
  const ox = eyeOX, oy = eyeOY;

  return (
    <>
      {/* Eye whites */}
      <ellipse cx={-18} cy={-8} rx={12} ry={blinkH} fill="#fffef8" />
      <ellipse cx={ 18} cy={-8} rx={12} ry={blinkH} fill="#fffef8" />

      {!blinking && (
        <>
          {/* Irises */}
          <ellipse cx={-18 + ox} cy={-8 + oy} rx={9}   ry={10}      fill={ch.eye} />
          <ellipse cx={ 18 + ox} cy={-8 + oy} rx={9}   ry={10}      fill={ch.eye} />
          {/* Pupils */}
          <ellipse cx={-18 + ox} cy={-8 + oy} rx={5.5} ry={6.5}     fill="#06040e" />
          <ellipse cx={ 18 + ox} cy={-8 + oy} rx={5.5} ry={6.5}     fill="#06040e" />
          {/* Catchlight */}
          <ellipse cx={-21 + ox} cy={-11 + oy} rx={3.2} ry={3}      fill="rgba(255,255,255,0.9)" />
          <ellipse cx={ 15 + ox} cy={-11 + oy} rx={3.2} ry={3}      fill="rgba(255,255,255,0.9)" />
          {/* Iris glow ring */}
          <ellipse cx={-18 + ox} cy={-8 + oy} rx={9}   ry={10}      fill="none" stroke={ch.eye} strokeWidth="0.6" opacity="0.4" />
          <ellipse cx={ 18 + ox} cy={-8 + oy} rx={9}   ry={10}      fill="none" stroke={ch.eye} strokeWidth="0.6" opacity="0.4" />
        </>
      )}

      {/* Eye outline */}
      <ellipse cx={-18} cy={-8} rx={12} ry={blinkH} fill="none" stroke="rgba(30,12,4,0.28)" strokeWidth="0.8" />
      <ellipse cx={ 18} cy={-8} rx={12} ry={blinkH} fill="none" stroke="rgba(30,12,4,0.28)" strokeWidth="0.8" />

      {/* Upper lash line — only when open */}
      {!blinking && (
        <>
          <path d={`M ${-18 - 12},-8 A 12,14 0 0,1 ${-18 + 12},-8`} fill="none" stroke="rgba(20,8,4,0.5)" strokeWidth="1.6" strokeLinecap="round" />
          <path d={`M ${ 18 - 12},-8 A 12,14 0 0,1 ${ 18 + 12},-8`} fill="none" stroke="rgba(20,8,4,0.5)" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </>
  );
}

function Mouth({ open }: { open: boolean }) {
  if (open) {
    return (
      <>
        {/* Open mouth cavity */}
        <ellipse cx="0" cy="30" rx="13" ry="9" fill="#2a0c0c" />
        {/* Upper teeth */}
        <path d="M -12,28 Q 0,24 12,28 Q 12,32 0,31 Q -12,32 -12,28 Z" fill="#f5f0e8" />
        {/* Lower teeth */}
        <ellipse cx="0" cy="35" rx="8" ry="4" fill="#eae5dc" />
      </>
    );
  }
  return (
    <>
      {/* Friendly smile */}
      <path d="M -13,28 Q -5,38 5,38 Q 13,38 15,28" fill="none" stroke="#8a3a30" strokeWidth="2.6" strokeLinecap="round" />
      {/* Subtle dimples */}
      <ellipse cx="-16" cy="30" rx="3" ry="2.5" fill="rgba(210,115,80,0.18)" />
      <ellipse cx=" 16" cy="30" rx="3" ry="2.5" fill="rgba(210,115,80,0.18)" />
    </>
  );
}

// ── Clothing ───────────────────────────────────────────────
// brandColor fills the shirt; badge shows brandName
function Clothing({
  brandColor, brandName,
  skin, skinD, skinL,
}: {
  brandColor: string; brandName: string;
  skin: string; skinD: string; skinL: string;
}) {
  // Neck
  const neckX = HX - 14, neckY = 128, neckW = 28, neckH = 26;

  return (
    <>
      {/* Neck */}
      <rect x={neckX} y={neckY} width={neckW} height={neckH} rx="10"
        fill={`url(#neckGrad)`} />
      <defs>
        <linearGradient id="neckGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={skinD} />
          <stop offset="40%"  stopColor={skin} />
          <stop offset="60%"  stopColor={skinL} />
          <stop offset="100%" stopColor={skinD} />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={brandColor} stopOpacity="1" />
          <stop offset="100%" stopColor={brandColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Left arm (static, hangs down) */}
      <path
        d={`M ${HX - 52},150 C ${HX - 74},162 ${HX - 80},198 ${HX - 76},228
            Q ${HX - 75},236 ${HX - 68},235 Q ${HX - 60},232 ${HX - 61},222
            C ${HX - 63},190 ${HX - 57},162 ${HX - 40},150 Z`}
        fill={brandColor} opacity="0.85"
      />

      {/* Right arm — animated (wave) — wrapped in pivot group in JSX below */}
      {/* Body / shirt */}
      <path
        d={`M ${HX - 56},150 C ${HX - 74},158 ${HX - 72},182 ${HX - 70},210
            L ${HX - 68},268 Q ${HX - 68},278 ${HX - 50},278
            L ${HX + 50},278 Q ${HX + 68},278 ${HX + 68},268
            L ${HX + 70},210 C ${HX + 72},182 ${HX + 74},158 ${HX + 56},150 Z`}
        fill={`url(#bodyGrad)`}
      />

      {/* Collar V-line */}
      <path d={`M ${HX - 16},150 Q ${HX},172 ${HX + 16},150`}
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

      {/* Brand badge on chest */}
      <rect x={HX - 28} y={196} width="56" height="20" rx="10"
        fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <text
        x={HX} y={210}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="7.5" fontWeight="700" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        fill="rgba(255,255,255,0.92)"
        letterSpacing="0.5"
      >
        {brandName.toUpperCase().slice(0, 10)}
      </text>
    </>
  );
}

// ── Main component ─────────────────────────────────────────
export default function BrandAvatar({
  character    = "alex",
  brandColor   = "#7c6cff",
  brandName    = "MEETZY",
  animation    = "idle",
  isSpeaking   = false,
  size         = 220,
  className    = "",
  mousePosition,
  containerRef,
}: BrandAvatarProps) {
  const ch = AVATAR_CHARS[character];

  // Animation refs
  const floatRef    = useRef<SVGGElement>(null);
  const headRef     = useRef<SVGGElement>(null);
  const rightArmRef = useRef<SVGGElement>(null);
  const svgRef      = useRef<SVGSVGElement>(null);

  // React state
  const [blinking,  setBlinking]  = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [eyeOX,     setEyeOX]     = useState(0);
  const [eyeOY,     setEyeOY]     = useState(0);
  const eyeOXRef = useRef(0);
  const eyeOYRef = useRef(0);

  // Mouse-based eye tracking
  useEffect(() => {
    if (!mousePosition || !containerRef?.current) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect   = svgEl.getBoundingClientRect();
    const charX  = rect.left + rect.width * 0.5;
    const charY  = rect.top  + rect.height * 0.28; // approximate eye height
    const dx     = mousePosition.x - charX;
    const dy     = mousePosition.y - charY;
    const dist   = Math.sqrt(dx * dx + dy * dy);
    const max    = 380;
    const factor = dist < max ? Math.min(1, dist / max) : 0;
    const tx     = (dx / Math.max(dist, 1)) * 4 * factor;
    const ty     = (dy / Math.max(dist, 1)) * 3 * factor;
    // Smooth via lerp
    eyeOXRef.current += (tx - eyeOXRef.current) * 0.12;
    eyeOYRef.current += (ty - eyeOYRef.current) * 0.12;
    setEyeOX(parseFloat(eyeOXRef.current.toFixed(2)));
    setEyeOY(parseFloat(eyeOYRef.current.toFixed(2)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mousePosition]);

  // ── Idle float (always on) ─────────────────────────────
  useEffect(() => {
    const el = floatRef.current;
    if (!el) return;
    const anim = el.animate(
      [
        { transform: "translateY(0px)" },
        { transform: "translateY(-6px)" },
        { transform: "translateY(0px)" },
      ],
      { duration: 3200, iterations: Infinity, easing: "ease-in-out" }
    );
    return () => anim.cancel();
  }, []);

  // ── Blink loop ─────────────────────────────────────────
  useEffect(() => {
    function scheduleBlink() {
      const delay = 2500 + Math.random() * 2500;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          timeoutRef.current = scheduleBlink();
        }, 180);
      }, delay);
    }
    const timeoutRef = { current: scheduleBlink() };
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // ── Mouth animation when speaking ─────────────────────
  useEffect(() => {
    if (!isSpeaking) { setMouthOpen(false); return; }
    let open = true;
    const id = setInterval(() => {
      setMouthOpen(open);
      open = !open;
    }, 180);
    return () => { clearInterval(id); setMouthOpen(false); };
  }, [isSpeaking]);

  // ── Wave / Thinking animations ─────────────────────────
  useEffect(() => {
    const arm  = rightArmRef.current;
    const head = headRef.current;

    // Cancel previous
    arm?.getAnimations().forEach(a => a.cancel());
    head?.getAnimations().forEach(a => a.cancel());

    if (animation === "wave" && arm) {
      // Arm raises up and wiggles — pivot is at 0,0 of the group (shoulder)
      arm.animate(
        [
          { transform: "rotate(0deg)"   },
          { transform: "rotate(-90deg)" },
          { transform: "rotate(-70deg)" },
          { transform: "rotate(-95deg)" },
          { transform: "rotate(-72deg)" },
          { transform: "rotate(-90deg)" },
          { transform: "rotate(0deg)"   },
        ],
        { duration: 2000, easing: "ease-in-out", fill: "forwards" }
      );
    }

    if (animation === "thinking" && head) {
      // Head tilts rhythmically
      head.animate(
        [
          { transform: "rotate(0deg)"  },
          { transform: "rotate(7deg)"  },
          { transform: "rotate(5deg)"  },
          { transform: "rotate(8deg)"  },
          { transform: "rotate(5deg)"  },
        ],
        { duration: 2200, iterations: Infinity, easing: "ease-in-out" }
      );
    }
  }, [animation]);

  const svgH = Math.round(size * (VH / VW));

  // Skin shorthand for Clothing prop
  const { skin, skinD, skinL, hair } = ch;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      width={size}
      height={svgH}
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Face gradient */}
        <radialGradient id={`faceGrad-${character}`} cx="40%" cy="38%" r="62%">
          <stop offset="0%"   stopColor={ch.skinL} />
          <stop offset="48%"  stopColor={ch.skin}  />
          <stop offset="80%"  stopColor={ch.skinD} />
          <stop offset="100%" stopColor="#b06030"  />
        </radialGradient>
        {/* Drop shadow filter */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Float wrapper — entire character floats */}
      <g ref={floatRef}>

        {/* ── CLOTHING + BODY ── */}
        {/* Right arm — pivot wrapper at shoulder (160, 150) */}
        <g transform={`translate(${HX + 56}, 150)`}>
          <g ref={rightArmRef}>
            {/* Arm shape in local coords (0,0 = shoulder) */}
            <path
              d="M 0,0 C 22,12 28,48 24,78 Q 22,86 14,85 Q 6,82 7,72 C 9,42 4,12 -12,0 Z"
              fill={brandColor} opacity="0.85"
            />
            {/* Hand */}
            <rect x="4" y="82" width="18" height="14" rx="7"
              fill={ch.skin} />
          </g>
        </g>

        {/* Clothing (neck, left arm, body, badge) */}
        <Clothing
          brandColor={brandColor}
          brandName={brandName}
          skin={skin} skinD={skinD} skinL={skinL}
        />

        {/* Ground shadow */}
        <ellipse cx={HX} cy={VH - 8} rx="56" ry="8" fill="rgba(0,0,0,0.1)" />

        {/* ── HEAD with pivot for tilt ── */}
        <g transform={`translate(${HX}, ${HY})`}>
          <g ref={headRef} filter="url(#shadow)">

            {/* Hair back layer (long pieces behind face) */}
            <HairBack c={character} ch={ch} />

            {/* Ears */}
            <ellipse cx="-44" cy="2"  rx="9" ry="12" fill={ch.skin} />
            <ellipse cx=" 44" cy="2"  rx="9" ry="12" fill={ch.skin} />
            <ellipse cx="-44" cy="3"  rx="4" ry="6"  fill={`rgba(0,0,0,0.1)`} />
            <ellipse cx=" 44" cy="3"  rx="4" ry="6"  fill={`rgba(0,0,0,0.1)`} />

            {/* Face */}
            <ellipse cx="0" cy="2" rx="43" ry="47"
              fill={`url(#faceGrad-${character})`} />

            {/* Jaw shadow */}
            <ellipse cx="0" cy="36" rx="30" ry="14"
              fill="rgba(0,0,0,0.06)" />

            {/* Hair front layer */}
            <HairFront c={character} ch={ch} />

            {/* Eyebrows */}
            <path d="M -29,-26 Q -20,-32 -8,-28"
              fill="none" stroke={hair} strokeWidth="3.2" strokeLinecap="round" />
            <path d="M  8,-28 Q  20,-32  29,-26"
              fill="none" stroke={hair} strokeWidth="3.2" strokeLinecap="round" />

            {/* Eyes */}
            <Eyes ch={ch} blinking={blinking} eyeOX={eyeOX} eyeOY={eyeOY} />

            {/* Nose — simple button dots */}
            <ellipse cx="-5" cy="16" rx="4" ry="2.8" fill="rgba(150,80,45,0.22)" transform="rotate(18,-5,16)" />
            <ellipse cx=" 5" cy="16" rx="4" ry="2.8" fill="rgba(150,80,45,0.22)" transform="rotate(-18,5,16)" />

            {/* Cheek blush */}
            <ellipse cx="-34" cy="14" rx="12" ry="8"  fill="rgba(230,120,90,0.1)"  />
            <ellipse cx=" 34" cy="14" rx="12" ry="8"  fill="rgba(230,120,90,0.1)"  />

            {/* Mouth */}
            <Mouth open={mouthOpen} />

            {/* Thinking indicator — hand-near-chin visual when thinking */}
            {animation === "thinking" && (
              <g opacity="0.85">
                {/* Small hand shape near chin */}
                <rect x="18" y="44" width="22" height="14" rx="7"
                  fill={ch.skin} stroke={ch.skinD} strokeWidth="0.5" />
                {/* Thought dots */}
                <circle cx="-8" cy="-60" r="3.5" fill="rgba(124,108,255,0.6)" />
                <circle cx=" 0" cy="-68" r="5"   fill="rgba(124,108,255,0.5)" />
                <circle cx=" 10" cy="-78" r="7"  fill="rgba(124,108,255,0.4)" />
              </g>
            )}
          </g>
        </g>

      </g>
    </svg>
  );
}

// ── Small version (for chat headers, FABs) ─────────────────
export function BrandAvatarSmall({
  character  = "alex",
  brandColor = "#7c6cff",
  isSpeaking = false,
  size       = 44,
}: Pick<BrandAvatarProps, "character" | "brandColor" | "isSpeaking" | "size">) {
  return (
    <BrandAvatar
      character={character}
      brandColor={brandColor}
      isSpeaking={isSpeaking}
      animation="idle"
      size={size}
      className="rounded-full overflow-hidden"
    />
  );
}

// ── Character picker for wizard step ──────────────────────
export function AvatarPicker({
  value,
  onChange,
  brandColor = "#7c6cff",
}: {
  value    : AvatarCharacter;
  onChange : (c: AvatarCharacter) => void;
  brandColor?: string;
}) {
  const chars = Object.keys(AVATAR_CHARS) as AvatarCharacter[];
  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {chars.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] p-3 border-2 transition-all
            ${value === c
              ? "border-[var(--accent)] bg-[var(--accent)]/8 scale-105"
              : "border-[var(--border-default)] hover:border-[var(--border-strong)] hover:scale-102"
            }`}
        >
          <BrandAvatar
            character={c}
            brandColor={brandColor}
            brandName=""
            animation="idle"
            size={100}
          />
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">
            {AVATAR_CHARS[c].label}
          </span>
        </button>
      ))}
    </div>
  );
}
