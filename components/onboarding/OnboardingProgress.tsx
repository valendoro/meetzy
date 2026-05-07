"use client";

import type { PrimaryChar } from "@/components/onboarding/resolve-archetype";

export type OnboardFlowStep =
  | "biz"
  | "char-primary"
  | "char-secondary"
  | "color"
  | "logo"
  | "agent"
  | "url"
  | "atype";

const LABELS: { id: OnboardFlowStep; short: string }[] = [
  { id: "biz", short: "Marca" },
  { id: "char-primary", short: "Tipo" },
  { id: "char-secondary", short: "Variante" },
  { id: "color", short: "Color" },
  { id: "logo", short: "Logo" },
  { id: "agent", short: "Nombre" },
  { id: "url", short: "Web" },
  { id: "atype", short: "Rol" },
];

function needsSecondaryChar(primary: PrimaryChar | null): boolean {
  if (!primary) return false;
  return primary === "human" || primary === "fruta" || primary === "objeto" || primary === "animal";
}

function stepToIndex(step: OnboardFlowStep, primary: PrimaryChar | null): number {
  const sec = needsSecondaryChar(primary);
  const order: OnboardFlowStep[] = sec
    ? ["biz", "char-primary", "char-secondary", "color", "logo", "agent", "url", "atype"]
    : ["biz", "char-primary", "color", "logo", "agent", "url", "atype"];
  const i = order.indexOf(step);
  return i < 0 ? 0 : i;
}

function totalSteps(primary: PrimaryChar | null): number {
  return needsSecondaryChar(primary) ? 8 : 7;
}

export function onboardingProgressFraction(step: OnboardFlowStep, primary: PrimaryChar | null): { current: number; total: number; pct: number } {
  const cur = stepToIndex(step, primary);
  const tot = totalSteps(primary);
  const pct = Math.round(((cur + 1) / tot) * 100);
  return { current: cur + 1, total: tot, pct };
}

/** Vertical rail — desktop only elegant step strip */
export default function OnboardingProgress({
  step,
  primary,
  brandColor,
}: {
  step: OnboardFlowStep;
  primary: PrimaryChar | null;
  brandColor: string;
}) {
  const sec = needsSecondaryChar(primary);
  const active = LABELS.filter((L) => {
    if (L.id === "char-secondary") return sec;
    return true;
  });

  const idx = stepToIndex(step, primary);

  return (
    <div className="ob-progress hidden lg:flex" aria-hidden>
      <div
        className="ob-progress-track"
        style={{
          background: `linear-gradient(180deg, ${brandColor}33 0%, rgba(255,255,255,0.06) 100%)`,
        }}
      />
      <ol className="ob-progress-list">
        {active.map((item, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <li key={item.id} className={`ob-progress-item ${current ? "is-current" : ""} ${done ? "is-done" : ""}`}>
              <span className="ob-progress-dot" style={current ? { boxShadow: `0 0 16px ${brandColor}88` } : undefined} />
              <span className="ob-progress-label">{item.short}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
