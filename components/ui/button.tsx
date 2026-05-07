import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-white shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-overlay)]",
        ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
        danger:
          "bg-[var(--error-subtle)] border border-[rgba(239,68,68,0.25)] text-[var(--error)] hover:bg-[rgba(239,68,68,0.15)]",
      },
      size: {
        sm: "h-8 rounded-[var(--radius-sm)] px-3 text-[13px]",
        md: "h-[38px] rounded-[var(--radius-md)] px-[18px] text-sm",
        lg: "h-11 rounded-[var(--radius-md)] px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
