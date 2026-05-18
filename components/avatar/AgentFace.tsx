"use client";

/**
 * AgentFace — cara circular limpia para el widget de chat
 *
 * Solo la cara, sin cuerpo. Diseñada para funcionar bien en burbujas (40–80px).
 * Animaciones: blink (CSS), speaking (boca abre/cierra), idle (leve pulso).
 * El color de cabello/detalles toma el brandColor.
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
  // Paleta derivada del brandColor para pelo y detalles
  const id = `face-${brandColor.replace("#", "")}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ display: "block" }}
        aria-hidden="true"
      >
        {/* ── Fondo del círculo ── */}
        <circle cx="50" cy="50" r="50" fill="#f5c9a0" />

        {/* ── Cuello ── */}
        <ellipse cx="50" cy="93" rx="13" ry="9" fill="#e8a87a" />

        {/* ── Cara — sombra suave debajo del pelo ── */}
        <ellipse cx="50" cy="58" rx="28" ry="30" fill="#f5c9a0" />

        {/* ── Sombras laterales de la cara ── */}
        <ellipse cx="24" cy="58" rx="5" ry="10" fill="#e8a87a" opacity="0.45" />
        <ellipse cx="76" cy="58" rx="5" ry="10" fill="#e8a87a" opacity="0.45" />

        {/* ── Pelo ── */}
        <ellipse cx="50" cy="28" rx="30" ry="22" fill={brandColor} />
        {/* Flequillo que baja sobre la frente */}
        <ellipse cx="50" cy="38" rx="30" ry="14" fill={brandColor} />
        {/* Pelo lateral izquierdo */}
        <ellipse cx="22" cy="48" rx="9" ry="14" fill={brandColor} />
        {/* Pelo lateral derecho */}
        <ellipse cx="78" cy="48" rx="9" ry="14" fill={brandColor} />

        {/* ── Frente de piel (sobre la base del pelo) ── */}
        <ellipse cx="50" cy="52" rx="24" ry="22" fill="#f5c9a0" />

        {/* ── Cejas ── */}
        <path d="M33 42 Q38 39 43 41" stroke="#6b4226" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M57 41 Q62 39 67 42" stroke="#6b4226" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* ── Ojos ── */}
        {/* ojo izquierdo */}
        <g style={{ transformOrigin: "38px 52px" }}>
          <ellipse cx="38" cy="52" rx="5.5" ry="5.5" fill="white" />
          <ellipse cx="38" cy="52.5" rx="3.2" ry="3.2" fill="#3d2b1f" />
          <circle cx="39.5" cy="51" r="1.1" fill="white" />
          {/* párpado */}
          <ellipse
            cx="38" cy="49" rx="6" ry="3"
            fill="#f5c9a0"
            style={{ animation: "agentBlink 4s ease-in-out 1.5s infinite" }}
          />
        </g>
        {/* ojo derecho */}
        <g style={{ transformOrigin: "62px 52px" }}>
          <ellipse cx="62" cy="52" rx="5.5" ry="5.5" fill="white" />
          <ellipse cx="62" cy="52.5" rx="3.2" ry="3.2" fill="#3d2b1f" />
          <circle cx="63.5" cy="51" r="1.1" fill="white" />
          {/* párpado */}
          <ellipse
            cx="62" cy="49" rx="6" ry="3"
            fill="#f5c9a0"
            style={{ animation: "agentBlink 4s ease-in-out 1.5s infinite" }}
          />
        </g>

        {/* ── Nariz ── */}
        <ellipse cx="50" cy="60" rx="3" ry="2" fill="#e8a87a" opacity="0.7" />

        {/* ── Boca ── */}
        {isSpeaking ? (
          // Boca abierta (hablando)
          <ellipse
            cx="50" cy="69" rx="7" ry="4"
            fill="#c47a5a"
            style={{ animation: "agentTalk 0.35s ease-in-out infinite alternate" }}
          />
        ) : (
          // Sonrisa
          <path
            d="M43 67 Q50 74 57 67"
            stroke="#c47a5a"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* ── Rubor (mejillas) ── */}
        <ellipse cx="29" cy="65" rx="6" ry="3.5" fill="#f0a0a0" opacity="0.35" />
        <ellipse cx="71" cy="65" rx="6" ry="3.5" fill="#f0a0a0" opacity="0.35" />
      </svg>

      <style>{`
        @keyframes agentBlink {
          0%, 88%, 100% { ry: 3; }
          92%, 96%      { ry: 6; }
        }
        @keyframes agentTalk {
          from { ry: 2.5; }
          to   { ry: 5; }
        }
      `}</style>
    </div>
  );
}
