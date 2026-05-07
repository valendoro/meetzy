"use client";

import type { ReactNode } from "react";

/** Ficha seleccionable — capas vidrio + acento champagne (premium) */
export function SelectableTile({
  selected,
  onClick,
  children,
  className = "",
  "aria-pressed": ariaPressed,
  "aria-label": ariaLabel,
}: {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  "aria-pressed"?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={ariaPressed ?? selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`ob-tile group flex flex-col items-center justify-center gap-2 text-center focus:outline-none ${selected ? "ob-tile--selected" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
