import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const variants = {
  default:
    "border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]/80",
  success:
    "border border-green-800/40 bg-green-950/70 text-green-300 dark:bg-green-950/80 dark:text-green-300",
  warning:
    "border border-amber-800/40 bg-amber-950/70 text-amber-300",
  info:
    "border border-blue-800/40 bg-blue-950/70 text-blue-300 dark:bg-blue-950/80 dark:text-blue-300",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
