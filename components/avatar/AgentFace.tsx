"use client";

/**
 * AgentFace — cara circular minimalista para widget de chat
 * Diseño limpio, moderno, amigable. CSS animations puras.
 * brandColor → color del pelo + detalles de ropa.
 */

interface AgentFaceProps {
  size?       : number;
  brandColor? : string;
  isSpeaking? : boolean;
  className?  : string;
}

export default function AgentFace({
  size       = 56,
  brandColor = "#7c6cff",
  isSpeaking = false,
  className  = "",
}: AgentFaceProps) {
  const darken = (hex: string, amt: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 0xff) - amt);
    const b = Math.max(0, (n & 0xff) - amt);
    return `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
  };
  const hairDark = darken(brandColor, 40);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size, flexShrink: 0, background: "#f5c5a3" }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ display: "block", position: "absolute", inset: 0 }}
        aria-hidden="true"
      >
        {/* ─── Skin background ─── */}
        <circle cx="50" cy="50" r="50" fill="#f5c5a3" />

        {/* ─── Neck ─── */}
        <path d="M40 88 Q50 94 60 88 L60 100 L40 100Z" fill="#e8a87a" />

        {/* ─── Jaw / lower face ─── */}
        <ellipse cx="50" cy="68" rx="22" ry="20" fill="#f5c5a3" />

        {/* ─── Ear left ─── */}
        <ellipse cx="22" cy="55" rx="5" ry="7" fill="#f0b88a" />
        <ellipse cx="23" cy="55" rx="2.5" ry="4" fill="#e8a87a" />

        {/* ─── Ear right ─── */}
        <ellipse cx="78" cy="55" rx="5" ry="7" fill="#f0b88a" />
        <ellipse cx="77" cy="55" rx="2.5" ry="4" fill="#e8a87a" />

        {/* ─── Hair base (back) ─── */}
        <ellipse cx="50" cy="26" rx="31" ry="26" fill={brandColor} />

        {/* ─── Face skin on top of hair base ─── */}
        <ellipse cx="50" cy="52" rx="25" ry="27" fill="#f5c5a3" />

        {/* ─── Forehead skin blending into hair ─── */}
        <ellipse cx="50" cy="34" rx="24" ry="16" fill="#f5c5a3" />

        {/* ─── Hair top / fringe ─── */}
        <ellipse cx="50" cy="20" rx="31" ry="20" fill={brandColor} />
        {/* Hair shadow under fringe */}
        <ellipse cx="50" cy="35" rx="26" ry="7" fill={hairDark} opacity="0.35" />

        {/* ─── Hair side left ─── */}
        <ellipse cx="20" cy="46" rx="8" ry="18" fill={brandColor} />
        {/* ─── Hair side right ─── */}
        <ellipse cx="80" cy="46" rx="8" ry="18" fill={brandColor} />

        {/* ─── Forehead (re-drawn over sides) ─── */}
        <ellipse cx="50" cy="40" rx="22" ry="18" fill="#f5c5a3" />

        {/* ─── Eyebrows ─── */}
        <path d="M31 43 Q37.5 39.5 44 42" stroke="#7a4c2e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M56 42 Q62.5 39.5 69 43" stroke="#7a4c2e" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* ─── Eyes — whole group scales for blink ─── */}
        {/* Eye left */}
        <g
          style={{
            animation: "af-blink 5s ease-in-out 2s infinite",
            transformOrigin: "37.5px 52px",
          }}
        >
          <ellipse cx="37.5" cy="52" rx="6"   ry="6.5" fill="white" />
          <ellipse cx="37.5" cy="53" rx="4"   ry="4"   fill="#3d2b1f" />
          <circle  cx="39.5" cy="51.2"        r="1.3"  fill="white" />
          <circle  cx="37.5" cy="54.5"        r="0.7"  fill="#6b3f2a" opacity="0.4" />
        </g>
        {/* Upper eyelid mask — hides top of eye during blink */}
        <ellipse cx="37.5" cy="45.5" rx="7" ry="3.5" fill="#f5c5a3" />

        {/* Eye right */}
        <g
          style={{
            animation: "af-blink 5s ease-in-out 2s infinite",
            transformOrigin: "62.5px 52px",
          }}
        >
          <ellipse cx="62.5" cy="52" rx="6"   ry="6.5" fill="white" />
          <ellipse cx="62.5" cy="53" rx="4"   ry="4"   fill="#3d2b1f" />
          <circle  cx="64.5" cy="51.2"        r="1.3"  fill="white" />
          <circle  cx="62.5" cy="54.5"        r="0.7"  fill="#6b3f2a" opacity="0.4" />
        </g>
        {/* Upper eyelid mask right */}
        <ellipse cx="62.5" cy="45.5" rx="7" ry="3.5" fill="#f5c5a3" />

        {/* ─── Nose ─── */}
        <ellipse cx="50" cy="62" rx="2.5" ry="1.8" fill="#d9906a" opacity="0.6" />

        {/* ─── Mouth ─── */}
        {isSpeaking ? (
          <ellipse
            cx="50" cy="71"
            rx="6" ry="3"
            fill="#c0675a"
            style={{
              animation: "af-talk 0.25s ease-in-out infinite alternate",
              transformOrigin: "50px 71px",
            }}
          />
        ) : (
          <>
            {/* Smile */}
            <path
              d="M42 68 Q50 76 58 68"
              stroke="#c0675a"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Upper lip line */}
            <path
              d="M44.5 67.5 Q50 65.5 55.5 67.5"
              stroke="#d4856e"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
          </>
        )}

        {/* ─── Cheek blush ─── */}
        <ellipse cx="27" cy="65" rx="7" ry="4" fill="#f08080" opacity="0.22" />
        <ellipse cx="73" cy="65" rx="7" ry="4" fill="#f08080" opacity="0.22" />

        {/* ─── Collar / shirt hint at bottom ─── */}
        <path d="M28 98 Q35 88 50 92 Q65 88 72 98 L100 98 L100 100 L0 100 L0 98Z" fill={brandColor} opacity="0.9" />
      </svg>

      <style>{`
        @keyframes af-blink {
          0%, 86%, 100% { transform: scaleY(1); }
          88%            { transform: scaleY(0.08); }
          90%            { transform: scaleY(1); }
        }
        @keyframes af-talk {
          from { transform: scaleY(0.55); }
          to   { transform: scaleY(1.6); }
        }
      `}</style>
    </div>
  );
}
