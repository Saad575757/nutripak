import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Tone =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger";

const toneClasses: Record<Tone, string> = {
  neutral:
    "bg-muted text-muted-foreground border-border",
  primary:
    "bg-primary/10 text-primary border-primary/25",
  info: "bg-info-soft text-info-text border-info-border",
  success: "bg-success-soft text-success-text border-success-border",
  warning: "bg-warning-soft text-warning-text border-warning-border",
  danger: "bg-danger-soft text-danger-text border-danger-border",
};

interface StatusBadgeProps extends ComponentProps<"span"> {
  label: string;
  tone?: Tone;
  /** Renders a small dot so status is never communicated by color alone. */
  withDot?: boolean;
}

export function StatusBadge({
  label,
  tone = "neutral",
  withDot = true,
  className,
}: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(toneClasses[tone], className)}>
      {withDot ? (
        <span aria-hidden className="rounded-full bg-current size-1.5" />
      ) : null}
      {label}
    </Badge>
  );
}
