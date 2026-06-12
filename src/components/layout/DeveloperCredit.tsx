import { Building2, Rocket } from "lucide-react";
import {
  DEVELOPER_COMPANY,
  DEVELOPER_CREDIT_LABEL,
  DEVELOPER_NAME,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DeveloperCreditProps {
  variant?: "light" | "dark";
  className?: string;
}

export function DeveloperCredit({
  variant = "dark",
  className,
}: DeveloperCreditProps) {
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto",
        className
      )}
      role="contentinfo"
      aria-label={`${DEVELOPER_CREDIT_LABEL} ${DEVELOPER_NAME}, ${DEVELOPER_COMPANY}`}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border px-4 py-4 text-center shadow-sm sm:flex-row sm:gap-4 sm:px-5 sm:py-4 sm:text-left",
          isLight
            ? "border-brand-200/80 bg-gradient-to-br from-brand-50/90 via-white to-emerald-50/50 shadow-brand-500/5"
            : "border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-[hsl(var(--card))] to-brand-500/5 shadow-brand-500/10"
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
            isLight
              ? "bg-brand-100 text-brand-600 ring-brand-200"
              : "bg-brand-500/15 text-brand-400 ring-brand-500/30"
          )}
          aria-hidden
        >
          <Rocket className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-wider sm:text-[13px]",
              isLight ? "text-brand-700" : "text-brand-400"
            )}
          >
            {DEVELOPER_CREDIT_LABEL}
          </p>
          <p
            className={cn(
              "text-sm font-semibold leading-snug sm:text-base",
              isLight ? "text-slate-800" : "text-[hsl(var(--foreground))]"
            )}
          >
            {DEVELOPER_NAME}
          </p>
          <p
            className={cn(
              "inline-flex items-center justify-center gap-1.5 text-xs font-medium sm:justify-start sm:text-sm",
              isLight ? "text-slate-600" : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            <Building2
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                isLight ? "text-brand-600" : "text-brand-400"
              )}
              aria-hidden
            />
            {DEVELOPER_COMPANY}
          </p>
        </div>
      </div>
    </div>
  );
}
