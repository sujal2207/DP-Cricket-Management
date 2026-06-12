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
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))]/80 px-6 py-5">
          <div>
            {title && (
              <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
