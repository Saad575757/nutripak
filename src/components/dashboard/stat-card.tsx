import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  supporting?: string;
  iconClassName?: string;
}

/** Clean statistic card: icon, label, main number, optional supporting line. */
export function StatCard({
  icon: Icon,
  label,
  value,
  supporting,
  iconClassName,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <span
          className={cn(
            "bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg",
            iconClassName
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      {supporting ? (
        <p className="text-muted-foreground mt-1 text-xs">{supporting}</p>
      ) : null}
    </div>
  );
}
