"use client";

export default function TrustStrip() {
  const ITEMS = [
    "Setup en 10 minutos",
    "Sin código necesario",
    "Sin tarjeta para empezar",
    "Cancela cuando querés",
    "Behavioral tracking real",
    "Avatar con tu identidad",
    "Setup en 10 minutos",
    "Sin código necesario",
    "Sin tarjeta para empezar",
    "Cancela cuando querés",
    "Behavioral tracking real",
    "Avatar con tu identidad",
  ];

  return (
    <div className="trust-strip" aria-hidden="true">
      <div className="trust-track">
        {ITEMS.map((item, i) => (
          <div key={i} className="trust-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <style>{`
        .trust-strip {
          overflow: hidden;
          border-top: 1px solid var(--c-border);
          border-bottom: 1px solid var(--c-border);
          background: linear-gradient(180deg, var(--c-bg-subtle) 0%, var(--c-bg) 100%);
          padding: 14px 0;
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .trust-track {
          display: flex;
          gap: 40px;
          width: max-content;
          animation: trust-scroll 28s linear infinite;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--c-muted);
          letter-spacing: 0.01em;
        }
        @keyframes trust-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .trust-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
