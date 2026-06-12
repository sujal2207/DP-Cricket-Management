"use client";

import { cn } from "@/lib/utils";
import { checkboxCardClass } from "@/lib/ui-styles";

export interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  label: string;
  description?: string;
  options: readonly CheckboxOption[];
  selected: string[];
  onToggle: (value: string) => void;
  maxSelections?: number;
  error?: string;
  selectedLabel?: (count: number, max: number) => string;
  disabledOptions?: (value: string, selected: string[]) => boolean;
}

export function CheckboxGroup({
  label,
  description,
  options,
  selected,
  onToggle,
  maxSelections,
  error,
  selectedLabel,
  disabledOptions,
}: CheckboxGroupProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="form-label">{label}</p>
        {description && <p className="form-hint mt-1">{description}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled =
            disabledOptions?.(option.value, selected) ??
            (!isSelected && maxSelections !== undefined && selected.length >= maxSelections);

          return (
            <label
              key={option.value}
              className={checkboxCardClass(isSelected, isDisabled)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(option.value)}
                disabled={isDisabled}
                className="form-checkbox"
              />
              <span className="text-sm font-medium text-[hsl(var(--foreground))]/90">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
      {maxSelections !== undefined && (
        <p className="form-hint">
          {selectedLabel
            ? selectedLabel(selected.length, maxSelections)
            : `Selected: ${selected.length}/${maxSelections}`}
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
