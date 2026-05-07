import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("product-skeleton rounded-[var(--radius-sm)]", className)} {...props} />;
}

export { Skeleton };
