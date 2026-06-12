"use client";

import { cn } from "@/lib/utils";

export interface PublicCheckboxOption {
  value: string;
  label: string;
}

interface PublicCheckboxGroupProps {
  label: string;
  description?: string;
  options: readonly PublicCheckboxOption[];
  selected: string[];
  onToggle: (value: string) => void;
  maxSelections?: number;
  error?: string;
  selectedLabel?: (count: number, max: number) => string;
}

export function PublicCheckboxGroup({
  label,
  description,
  options,
  selected,
  onToggle,
  maxSelections,
  error,
  selectedLabel,
}: PublicCheckboxGroupProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
            {description}
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled =
            !isSelected &&
            maxSelections !== undefined &&
            selected.length >= maxSelections;

          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 shadow-sm transition-all",
                isSelected
                  ? "border-brand-500 bg-brand-50/80 ring-1 ring-brand-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(option.value)}
                disabled={isDisabled}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium leading-snug text-slate-800">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {maxSelections !== undefined && (
        <p className="text-xs text-slate-500">
          {selectedLabel
            ? selectedLabel(selected.length, maxSelections)
            : `Selected: ${selected.length}/${maxSelections}`}
        </p>
      )}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
