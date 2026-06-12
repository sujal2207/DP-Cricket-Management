"use client";

import type { ComponentType } from "react";
import {
  Check,
  CircleDot,
  HandMetal,
  HelpCircle,
  Shield,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CricketCategory } from "@/lib/constants";

export interface CategoryOption {
  value: string;
  label: string;
}

interface CategorySelectionGroupProps {
  options: readonly CategoryOption[];
  selected: string[];
  onToggle: (value: string) => void;
  maxSelections?: number;
  error?: string;
}

const CATEGORY_ICONS: Record<CricketCategory, ComponentType<{ className?: string }>> = {
  Batting: Target,
  Bowling: CircleDot,
  "All Rounder": HandMetal,
  "Wicket Keeper": Shield,
  "Don't Know Cricket But Want To Play": HelpCircle,
};

const WIDE_CATEGORY = "Don't Know Cricket But Want To Play";

export function CategorySelectionGroup({
  options,
  selected,
  onToggle,
  maxSelections = 2,
  error,
}: CategorySelectionGroupProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled =
            !isSelected && selected.length >= maxSelections;
          const isWide = option.value === WIDE_CATEGORY;
          const Icon =
            CATEGORY_ICONS[option.value as CricketCategory] ?? HelpCircle;

          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => onToggle(option.value)}
              className={cn(
                "group relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4",
                "border-[hsl(var(--border))] bg-[hsl(var(--input-bg))]/50",
                "hover:-translate-y-px hover:border-brand-500/45 hover:bg-brand-500/5 hover:shadow-md hover:shadow-brand-500/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
                isSelected &&
                  "border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/10 ring-1 ring-brand-500/30",
                isDisabled &&
                  "cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--input-bg))]/50 hover:shadow-none",
                isWide && "sm:col-span-2"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                  isSelected
                    ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                    : "bg-[hsl(var(--muted))]/80 text-[hsl(var(--muted-foreground))] group-hover:bg-brand-500/15 group-hover:text-brand-400"
                )}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </div>

              <span
                className={cn(
                  "min-w-0 flex-1 pt-1.5 text-sm font-medium leading-snug",
                  isSelected
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--foreground))]/85"
                )}
              >
                {option.label}
              </span>

              <span
                className={cn(
                  "absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200",
                  isSelected
                    ? "scale-100 bg-brand-500 text-white opacity-100"
                    : "scale-75 border border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 opacity-0 group-hover:opacity-60"
                )}
                aria-hidden
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

interface CategorySelectionBadgeProps {
  count: number;
  max: number;
  min?: number;
  error?: string;
}

export function CategorySelectionBadge({
  count,
  max,
  min = 1,
  error,
}: CategorySelectionBadgeProps) {
  const isValid = count >= min && count <= max && !error;
  const isExceeded = count > max;
  const needsSelection = count < min;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ring-1 transition-colors duration-200",
        isValid &&
          "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
        !isValid &&
          !isExceeded &&
          needsSelection &&
          "bg-amber-500/15 text-amber-400 ring-amber-500/30",
        (isExceeded || error) &&
          "bg-red-500/15 text-red-400 ring-red-500/30"
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          isValid && "bg-emerald-400",
          !isValid && !isExceeded && needsSelection && "bg-amber-400",
          (isExceeded || error) && "bg-red-400"
        )}
      />
      Selected: {count}/{max}
    </span>
  );
}
