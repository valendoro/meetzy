"use client";

import type { ReactNode } from "react";

/** Right column: vignette, slow aurora, pedestal spotlight */
export default function OnboardingStage({
  brandColor,
  children,
}: {
  brandColor: string;
  children: ReactNode;
}) {
  return (
    <div
      className="ob-stage relative flex min-h-[320px] flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 lg:min-h-screen lg:py-16"
      style={
        {
          "--stage-brand": brandColor,
        } as React.CSSProperties
      }
    >
      <div className="ob-stage-vignette pointer-events-none absolute inset-0" aria-hidden />
      <div className="ob-stage-aurora pointer-events-none absolute left-1/2 top-[38%] h-[min(85vh,820px)] w-[min(95vw,720px)] -translate-x-1/2 -translate-y-1/2" aria-hidden />
      <div className="ob-stage-grid pointer-events-none absolute inset-0 opacity-[0.17]" aria-hidden />
      <div className="ob-stage-pedestal pointer-events-none absolute bottom-[12%] left-1/2 h-24 w-[min(72%,420px)] -translate-x-1/2 rounded-[100%] blur-xl" aria-hidden />
      <div className="relative z-[1] flex flex-col items-center">{children}</div>
    </div>
  );
}
