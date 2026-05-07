"use client";

import type { ReactNode } from "react";

/** Ficha seleccionable — panel de vidrio + acento indigo al seleccionar */
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
