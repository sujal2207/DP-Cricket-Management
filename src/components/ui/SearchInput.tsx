import { cn } from "@/lib/utils";
import { formControlClass, formFieldSpacing } from "@/lib/ui-styles";
import type { LucideIcon } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

export function SearchInput({
  label,
  error,
  hint,
  icon: Icon,
  className,
  id,
  ...props
}: SearchInputProps) {
  const inputId = id || props.name;

  return (
    <div className={formFieldSpacing}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
            aria-hidden
          />
        )}
        <input
          id={inputId}
          className={cn(formControlClass(error), Icon && "pl-10", className)}
          {...props}
        />
      </div>
      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
