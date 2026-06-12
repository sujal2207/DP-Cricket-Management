import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  elevated?: boolean;
}

export function Card({
  children,
  className,
  title,
  description,
  action,
  elevated = false,
}: CardProps) {
  return (
    <div className={cn(elevated ? "surface-card-elevated" : "surface-card", className)}>
      {(title || action) && (
        <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))]/80 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
