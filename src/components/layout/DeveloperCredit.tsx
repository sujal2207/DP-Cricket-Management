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
  /** @deprecated All layouts are compact by default */
  compact?: boolean;
}

export function DeveloperCredit({
  variant = "dark",
  className,
}: DeveloperCreditProps) {
  const isLight = variant === "light";
  const isBrand = variant === "brand";

  const dividerClass = isBrand
    ? "bg-white/15"
    : isLight
      ? "bg-brand-200/60"
      : "bg-[hsl(var(--border))]/80";

  return (
    <div
      className={cn("w-full max-w-3xl mx-auto", className)}
      role="contentinfo"
      aria-label={`${DEVELOPER_CREDIT_LABEL} ${DEVELOPER_NAME}, ${DEVELOPER_COMPANY}. ${HOSTING_CREDIT_LABEL} ${DEVELOPER_COMPANY}.`}
    >
      <div
        className={cn(
          "rounded-xl border px-3 py-2.5 shadow-sm sm:px-4 sm:py-3",
          isBrand
            ? "border-white/20 bg-white/10 shadow-black/10 backdrop-blur-sm"
            : isLight
              ? "border-brand-200/80 bg-gradient-to-br from-brand-50/90 via-white to-emerald-50/50 shadow-brand-500/5"
              : "border-brand-500/20 bg-gradient-to-br from-brand-500/8 via-[hsl(var(--card))] to-brand-500/5 shadow-brand-500/5"
        )}
      >
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-0">
          <CreditRow
            icon={Rocket}
            label={DEVELOPER_CREDIT_LABEL}
            primary={DEVELOPER_NAME}
            secondary={DEVELOPER_COMPANY}
            showSecondaryIcon
            variant={variant}
            className="md:flex-1 md:pr-4"
          />

          <div
            className={cn("h-px w-full shrink-0 md:hidden", dividerClass)}
            aria-hidden
          />
          <div
            className={cn("hidden h-10 w-px shrink-0 md:block", dividerClass)}
            aria-hidden
          />

          <CreditRow
            icon={Cloud}
            label={HOSTING_CREDIT_LABEL}
            primary={DEVELOPER_COMPANY}
            variant={variant}
            className="md:flex-1 md:pl-4"
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
  className,
}: {
  icon: typeof Rocket;
  label: string;
  primary: string;
  secondary?: string;
  showSecondaryIcon?: boolean;
  variant: "light" | "dark" | "brand";
  className?: string;
}) {
  const isLight = variant === "light";
  const isBrand = variant === "brand";

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5 sm:gap-3", className)}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 sm:h-8 sm:w-8",
          isBrand
            ? "bg-white/15 text-white ring-white/20"
            : isLight
              ? "bg-brand-100 text-brand-600 ring-brand-200"
              : "bg-brand-500/15 text-brand-400 ring-brand-500/25"
        )}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>

      <div className="min-w-0 flex-1 text-left leading-tight">
        <p
          className={cn(
            "text-[9px] font-bold uppercase tracking-wider sm:text-[10px]",
            isBrand ? "text-brand-100" : isLight ? "text-brand-700" : "text-brand-400"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-xs font-semibold leading-snug sm:text-[13px]",
            isBrand ? "text-white" : isLight ? "text-slate-800" : "text-[hsl(var(--foreground))]"
          )}
        >
          {primary}
        </p>
        {secondary && (
          <p
            className={cn(
              "mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium sm:text-[11px]",
              isBrand
                ? "text-brand-100/90"
                : isLight
                  ? "text-slate-600"
                  : "text-[hsl(var(--muted-foreground))]"
            )}
          >
            {showSecondaryIcon && (
              <Building2
                className={cn(
                  "h-3 w-3 shrink-0",
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
