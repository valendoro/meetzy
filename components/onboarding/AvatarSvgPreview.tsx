"use client";

import type { AvatarArchetype } from "@/lib/avatar-prompt-builder";

type Stage = "placeholder" | "svg" | "image";

export default function AvatarSvgPreview({
  stage,
  archetype,
  brandColor,
  businessName,
  agentName,
  agentTypeLabel,
  logoUrl,
  imageUrl,
  personalityClass,
}: {
  stage: Stage;
  archetype: AvatarArchetype | null;
  brandColor: string;
  businessName: string;
  agentName: string;
  agentTypeLabel: string;
  logoUrl: string | null;
  imageUrl: string | null;
  personalityClass?: string;
}) {
  const breathe = personalityClass ?? "mz-ob-breathe";

  if (stage === "image" && imageUrl) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div
          className={`relative flex size-44 items-center justify-center sm:size-52 ${breathe}`}
          style={{ filter: "drop-shadow(0 20px 40px rgba(99,102,241,0.25))" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="mz-ob-scan size-full max-h-[min(52vw,280px)] rounded-3xl object-cover ring-2 ring-white/10"
          />
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="absolute bottom-3 right-3 size-10 rounded-lg bg-white/90 object-contain p-1 shadow-lg" />
          ) : null}
        </div>
        <div className="text-center font-syne text-lg font-bold tracking-tight text-white">{agentName || "Tu agente"}</div>
        <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200">
          {agentTypeLabel}
        </span>
        <div className="mt-2 w-full max-w-[280px] rounded-2xl border border-white/10 bg-black/30 p-3 text-left text-xs text-white/70 shadow-inner">
          <div className="mb-2 flex items-center gap-2">
            <div className="size-7 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="size-full object-cover" />
            </div>
            <span className="font-medium text-white">{agentName}</span>
          </div>
          <p className="leading-relaxed">¡Hola! ¿En qué te puedo ayudar hoy?</p>
        </div>
      </div>
    );
  }

  if (stage === "placeholder" || !archetype) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative flex size-44 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.03] sm:size-52"
          style={{
            boxShadow: `inset 0 0 60px ${brandColor}22`,
          }}
        >
          <div
            className="absolute inset-4 rounded-2xl opacity-40"
            style={{
              background: `linear-gradient(110deg, transparent 40%, ${brandColor}44 50%, transparent 60%)`,
              backgroundSize: "200% 100%",
              animation: "mz-shimmer 2.2s linear infinite",
            }}
          />
          <div className="relative text-center text-sm text-white/35">Tu agente aparecerá acá</div>
        </div>
        {businessName ? (
          <p className="font-syne text-sm font-semibold text-white/50">{businessName}</p>
        ) : null}
      </div>
    );
  }

  /* SVG approximation */
  const body = (
    <g className={breathe} style={{ transformOrigin: "center" }}>
      {(archetype === "human_male" || archetype === "human_female") ? (
        <>
          <ellipse cx="100" cy="72" rx="38" ry="44" fill={brandColor} opacity="0.95" />
          <circle cx="100" cy="68" r="30" fill="#ffecd1" />
          <circle cx="88" cy="62" r="4" fill="#1e1b4b" />
          <circle cx="112" cy="62" r="4" fill="#1e1b4b" />
          <path d="M 88 82 Q 100 92 112 82" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="62" y="108" width="76" height="70" rx="18" fill={brandColor} />
        </>
      ) : null}
      {(archetype === "dog" || archetype === "cat") && (
        <>
          <ellipse cx="100" cy="95" rx="48" ry="40" fill={brandColor} />
          <ellipse cx="70" cy="65" rx="18" ry="26" fill={brandColor} />
          <ellipse cx="130" cy="65" rx="18" ry="26" fill={brandColor} />
          <circle cx="88" cy="88" r="5" fill="#1e1b4b" />
          <circle cx="112" cy="88" r="5" fill="#1e1b4b" />
          <ellipse cx="100" cy="105" rx="10" ry="6" fill="#1e1b4b" opacity="0.5" />
        </>
      )}
      {["rabbit", "fox", "panda", "bear"].includes(archetype) && (
        <>
          <ellipse cx="100" cy="92" rx="44" ry="38" fill={brandColor} />
          <circle cx="85" cy="78" r="5" fill="#1e1b4b" />
          <circle cx="115" cy="78" r="5" fill="#1e1b4b" />
          <path
            d={archetype === "rabbit" ? "M 60 50 L 75 90 M 140 50 L 125 90" : "M 100 108 Q 100 118 90 122"}
            stroke={brandColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </>
      )}
      {["orange", "apple", "cup", "star", "rocket", "diamond"].includes(archetype) && (
        <>
          <circle cx="100" cy="95" r="46" fill={brandColor} opacity="0.9" />
          <circle cx="82" cy="82" r="7" fill="#1e1b4b" />
          <circle cx="118" cy="82" r="7" fill="#1e1b4b" />
          <path d="M 85 105 Q 100 118 115 105" stroke="#1e1b4b" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {logoUrl ? (
        <image href={logoUrl} x="78" y="118" width="44" height="44" preserveAspectRatio="xMidYMid meet" opacity="0.92" />
      ) : null}
    </g>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 200"
        className="h-44 w-44 sm:h-52 sm:w-52 drop-shadow-[0_16px_40px_rgba(99,102,241,0.2)]"
        role="img"
        aria-label="Preview del avatar"
      >
        {body}
      </svg>
      {agentName ? <p className="font-syne text-base font-bold text-white">{agentName}</p> : null}
      {businessName ? <p className="text-xs text-white/40">{businessName}</p> : null}
    </div>
  );
}
