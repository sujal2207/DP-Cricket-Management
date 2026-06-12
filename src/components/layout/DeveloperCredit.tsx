import { Building2, Cloud, Rocket } from "lucide-react";
import {
  DEVELOPER_COMPANY,
  DEVELOPER_CREDIT_LABEL,
  DEVELOPER_NAME,
  HOSTING_CREDIT_LABEL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DeveloperCreditProps {
  variant?: "light" | "dark" | "brand";
  className?: string;
  compact?: boolean;
}

export function DeveloperCredit({
  variant = "dark",
  className,
  compact = false,
}: DeveloperCreditProps) {
  const isLight = variant === "light";
  const isBrand = variant === "brand";

  return (
    <div
      className={cn("w-full max-w-xl mx-auto", className)}
      role="contentinfo"
      aria-label={`${DEVELOPER_CREDIT_LABEL} ${DEVELOPER_NAME}, ${DEVELOPER_COMPANY}. ${HOSTING_CREDIT_LABEL} ${DEVELOPER_COMPANY}.`}
    >
      <div
        className={cn(
          "rounded-2xl border shadow-sm",
          compact ? "px-3.5 py-3.5 sm:px-4" : "px-4 py-4 sm:px-5 sm:py-4",
          isBrand
            ? "border-white/20 bg-white/10 shadow-black/10 backdrop-blur-sm"
            : isLight
              ? "border-brand-200/80 bg-gradient-to-br from-brand-50/90 via-white to-emerald-50/50 shadow-brand-500/5"
              : "border-brand-500/25 bg-gradient-to-br from-brand-500/10 via-[hsl(var(--card))] to-brand-500/5 shadow-brand-500/10"
        )}
      >
        <div className="space-y-3">
          <CreditRow
            icon={Rocket}
            label={DEVELOPER_CREDIT_LABEL}
            primary={DEVELOPER_NAME}
            secondary={DEVELOPER_COMPANY}
            showSecondaryIcon
            variant={variant}
            compact={compact}
          />

          <div
            className={cn(
              "h-px",
              isBrand ? "bg-white/15" : isLight ? "bg-brand-200/60" : "bg-[hsl(var(--border))]/80"
            )}
            aria-hidden
          />

          <CreditRow
            icon={Cloud}
            label={HOSTING_CREDIT_LABEL}
            primary={DEVELOPER_COMPANY}
            variant={variant}
            compact={compact}
          />
        </div>
      </div>
    </div>
  );
}

function CreditRow({
  icon: Icon,
  label,
  primary,
  secondary,
  showSecondaryIcon = false,
  variant,
  compact,
}: {
  icon: typeof Rocket;
  label: string;
  primary: string;
  secondary?: string;
  showSecondaryIcon?: boolean;
  variant: "light" | "dark" | "brand";
  compact?: boolean;
}) {
  const isLight = variant === "light";
  const isBrand = variant === "brand";

  return (
    <div className="flex items-start gap-3 sm:gap-3.5">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl ring-1",
          compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11",
          isBrand
            ? "bg-white/15 text-white ring-white/20"
            : isLight
              ? "bg-brand-100 text-brand-600 ring-brand-200"
              : "bg-brand-500/15 text-brand-400 ring-brand-500/30"
        )}
        aria-hidden
      >
        <Icon className={cn(compact ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5")} />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5 text-left">
        <p
          className={cn(
            "font-bold uppercase tracking-wider",
            compact ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-xs",
            isBrand ? "text-brand-100" : isLight ? "text-brand-700" : "text-brand-400"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "font-semibold leading-snug",
            compact ? "text-xs sm:text-sm" : "text-sm sm:text-base",
            isBrand ? "text-white" : isLight ? "text-slate-800" : "text-[hsl(var(--foreground))]"
          )}
        >
          {primary}
        </p>
        {secondary && (
          <p
            className={cn(
              "inline-flex items-center gap-1.5 font-medium",
              compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm",
              isBrand ? "text-brand-100/90" : isLight ? "text-slate-600" : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            {showSecondaryIcon && (
              <Building2
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isBrand ? "text-white/80" : isLight ? "text-brand-600" : "text-brand-400"
                )}
                aria-hidden
              />
            )}
            {secondary}
          </p>
        )}
      </div>
    </div>
  );
}
