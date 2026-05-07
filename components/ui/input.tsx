import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, ...props }, ref) => (
    <div
      className={cn(
        "flex min-h-[40px] w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3.5 transition-[border-color,box-shadow] duration-150",
        "has-[:focus-visible]:border-[var(--border-focus)] has-[:focus-visible]:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]",
        error && "border-[rgba(239,68,68,0.5)] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]",
      )}
    >
      {leftIcon ? <span className="shrink-0 text-[var(--text-tertiary)]">{leftIcon}</span> : null}
      <input
        type={type}
        className={cn(
          "h-full min-h-[38px] w-full flex-1 bg-transparent py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";

export { Input };
