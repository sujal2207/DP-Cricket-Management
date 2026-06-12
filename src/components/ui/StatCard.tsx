import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  color?: "green" | "blue" | "purple" | "orange" | "red";
  loading?: boolean;
}

const colorMap = {
  green: {
    icon: "bg-green-500/15 text-green-400 ring-green-500/25",
    glow: "from-green-500/10",
    accent: "bg-green-500",
  },
  blue: {
    icon: "bg-blue-500/15 text-blue-400 ring-blue-500/25",
    glow: "from-blue-500/10",
    accent: "bg-blue-500",
  },
  purple: {
    icon: "bg-purple-500/15 text-purple-400 ring-purple-500/25",
    glow: "from-purple-500/10",
    accent: "bg-purple-500",
  },
  orange: {
    icon: "bg-orange-500/15 text-orange-400 ring-orange-500/25",
    glow: "from-orange-500/10",
    accent: "bg-orange-500",
  },
  red: {
    icon: "bg-red-500/15 text-red-400 ring-red-500/25",
    glow: "from-red-500/10",
    accent: "bg-red-500",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "green",
  loading,
}: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div className="stat-card group">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-60",
          styles.glow
        )}
        aria-hidden
      />
      <div
        className={cn("absolute left-0 top-0 h-0.5 w-full opacity-80", styles.accent)}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            {title}
          </p>
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
          ) : (
            <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          )}
          {trend && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105",
            styles.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
