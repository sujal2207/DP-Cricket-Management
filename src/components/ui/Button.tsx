import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:
    "bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-500 focus:ring-brand-500/40 dark:bg-brand-500 dark:hover:bg-brand-400",
  secondary:
    "border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/60 text-[hsl(var(--foreground))] shadow-sm hover:bg-[hsl(var(--muted))]",
  outline:
    "border border-[hsl(var(--border))] bg-[hsl(var(--input-bg))]/50 text-[hsl(var(--foreground))] shadow-sm hover:border-slate-500/60 hover:bg-[hsl(var(--muted))]/40",
  ghost:
    "text-[hsl(var(--foreground))]/80 hover:bg-[hsl(var(--muted))]/50 hover:text-[hsl(var(--foreground))]",
  danger:
    "bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-500 focus:ring-red-500/40",
};

const sizes = {
  sm: "h-9 rounded-lg px-3 text-xs",
  md: "h-11 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-xl px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
