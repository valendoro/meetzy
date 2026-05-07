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
      <div className="flex flex-col items-center gap-6">
        <div className="ob-avatar-float relative">
          <div
            className={`relative flex size-[11.5rem] items-center justify-center sm:size-[14rem] ${breathe}`}
            style={{ filter: "drop-shadow(0 28px 56px rgba(0,0,0,0.55)) drop-shadow(0 0 48px rgba(99,102,241,0.22))" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="mz-ob-scan size-full max-h-[min(52vw,300px)] rounded-[28px] object-cover ring-1 ring-white/15"
            />
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="absolute bottom-3 right-3 size-11 rounded-xl bg-white/95 object-contain p-1 shadow-xl ring-1 ring-black/10" />
            ) : null}
          </div>
        </div>
        <div className="text-center font-syne text-xl font-extrabold tracking-tight text-white md:text-2xl">{agentName || "Tu agente"}</div>
        <span className="rounded-full border border-[color:var(--ob-gold)]/35 bg-[color:var(--ob-gold)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--ob-champagne)]">
          {agentTypeLabel}
        </span>
        <div className="ob-glass mt-1 w-full max-w-[300px] rounded-[22px] p-4 text-left text-[13px] leading-relaxed text-white/75">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="size-full object-cover" />
            </div>
            <span className="font-syne font-bold text-white/95">{agentName}</span>
          </div>
          <p className="text-white/60">¡Hola! ¿En qué te puedo ayudar hoy?</p>
        </div>
      </div>
    );
  }

  if (stage === "placeholder" || !archetype) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="ob-avatar-float relative flex size-[11.5rem] items-center justify-center sm:size-[14rem]">
          <div
            className="absolute inset-[-6px] rounded-[32px] opacity-70"
            style={{
              background: `conic-gradient(from 90deg, transparent, ${brandColor}44, transparent 55%)`,
              animation: "ob-aurora-spin 12s linear infinite",
            }}
          />
          <div
            className="relative flex size-full items-center justify-center rounded-[28px] border border-white/[0.1] bg-white/[0.03]"
            style={{
              boxShadow: `inset 0 0 80px ${brandColor}18, 0 12px 40px rgba(0,0,0,0.4)`,
            }}
          >
            <div
              className="absolute inset-4 rounded-2xl opacity-45"
              style={{
                background: `linear-gradient(110deg, transparent 38%, ${brandColor}55 50%, transparent 62%)`,
                backgroundSize: "200% 100%",
                animation: "mz-shimmer 2.2s linear infinite",
              }}
            />
            <p className="relative px-6 text-center font-syne text-sm font-semibold text-white/40">Tu agente aparecerá acá</p>
          </div>
        </div>
        {businessName ? <p className="font-syne text-sm font-bold tracking-wide text-white/45">{businessName}</p> : null}
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
    <div className="flex flex-col items-center gap-5">
      <div className="ob-avatar-float relative">
        <svg
          viewBox="0 0 200 200"
          className="h-44 w-44 sm:h-56 sm:w-56"
          style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.45)) drop-shadow(0 0 36px rgba(99,102,241,0.15))" }}
          role="img"
          aria-label="Preview del avatar"
        >
          {body}
        </svg>
      </div>
      {agentName ? <p className="font-syne text-lg font-extrabold tracking-tight text-white">{agentName}</p> : null}
      {businessName ? <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{businessName}</p> : null}
    </div>
  );
}
