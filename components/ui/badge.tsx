import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
        success: "border-[rgba(34,197,94,0.25)] bg-[var(--success-subtle)] text-[var(--success)]",
        warning: "border-[rgba(245,158,11,0.25)] bg-[var(--warning-subtle)] text-[var(--warning)]",
        error: "border-[rgba(239,68,68,0.25)] bg-[var(--error-subtle)] text-[var(--error)]",
        accent: "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent)]",
        intent_exploring: "border-transparent bg-[rgba(100,116,139,0.2)] text-[var(--intent-exploring)]",
        intent_interested: "border-transparent bg-[rgba(59,130,246,0.15)] text-[var(--intent-interested)]",
        intent_evaluating: "border-transparent bg-[rgba(234,179,8,0.15)] text-[var(--intent-evaluating)]",
        intent_ready: "border-transparent bg-[rgba(249,115,22,0.15)] text-[var(--intent-ready)]",
        intent_hot: "intent-badge-hot border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[var(--intent-hot)]",
      },
      size: {
        sm: "text-[10px] px-1.5",
        md: "text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
