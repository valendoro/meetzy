import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useCreateAgentModal } from "@/components/providers/create-agent-modal";
import { cn } from "@/lib/cn";

export function CreateAgentLauncher({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "type"> & { children: React.ReactNode }) {
  const { open } = useCreateAgentModal();
  return (
    <Button type="button" variant={variant} size={size} {...props} className={cn(className)} onClick={open}>
      {children}
    </Button>
  );
}
